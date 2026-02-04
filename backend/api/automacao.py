import threading
import csv
import io
from datetime import datetime
from flask import request, Response, current_app, jsonify
from flask_restful import Resource
from concurrent.futures import ThreadPoolExecutor
from services.email_service import enviar_email
from drivers.tasy_automacao import processar_lote_titulos
from db.models import db, Job, JobResult


class AutomationManager:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=10)

    def start_job(self, titulos, app, job_type="BOLETOS"):
        new_job = Job(total=len(titulos), status="EM_ANDAMENTO", automation_type=job_type)

        db.session.add(new_job)
        db.session.commit()
        
        job_id = new_job.id
        chunks = self._chunk_list(titulos, 10)
        threading.Thread(target=self._run_batches, args=(job_id, chunks, app)).start()
        return str(job_id)

    def _chunk_list(self, lista, num_chunks):
        if not lista: return []
        avg = len(lista) / float(num_chunks)
        out = []
        last = 0.0
        while last < len(lista):
            out.append(lista[int(last):int(last + avg)])
            last += avg
        return out

    def _run_batches(self, job_id, chunks, app):
        """Executa em background COM contexto da aplicação"""

        def salvar_progresso(res):
            with app.app_context():
                try:
                    novo_resultado = JobResult(
                        job_id=job_id,
                        nr_titulo=str(res['nr_titulo']),
                        status=res['status'],
                        detalhe=res['detalhe']
                    )
                    db.session.add(novo_resultado)
                    Job.query.filter_by(id=job_id).update({'concluidos': Job.concluidos + 1})
                    db.session.commit()
                except Exception as e:
                    print(f"Erro ao salvar progresso parcial: {e}")
                    db.session.rollback()

        with app.app_context():
            futures = []
            for chunk_titulos in chunks:
                if not chunk_titulos: continue
                future = self.executor.submit(processar_lote_titulos, chunk_titulos, salvar_progresso)
                futures.append(future)

            for future in futures:
                try:
                    future.result()
                except Exception as e:
                    print(f"Erro no worker do job {job_id}: {e}")

            job = Job.query.get(job_id)
            job.status = "CONCLUIDO"
            job.end_time = datetime.now()
            db.session.commit()

            try:
                db.session.refresh(job)
                dados_para_email = {
                    'total': job.total,
                    'resultados': [
                        {
                            'nr_titulo': r.nr_titulo,
                            'status': r.status,
                            'detalhe': r.detalhe
                        }
                        for r in job.resultados
                    ]
                }
                enviar_email(job_id, dados_para_email)
            except Exception as e:
                print(f"Erro ao enviar email: {e}")


manager = AutomationManager()


# --- RESOURCES ---

class ExecutarAutomacao(Resource):
    def post(self):
        data = request.json
        titulos = data.get('titulos', [])

        if not titulos:
            return {"error": "Lista vazia"}, 400

        job_id = manager.start_job(titulos, current_app._get_current_object())

        return {"job_id": job_id, "message": "Iniciado"}, 202


class ReenviarFalhas(Resource):
    def post(self, job_id):
        job_original = Job.query.get(job_id)
        if not job_original:
            return {"error": "Job não encontrado"}, 404

        titulos_para_reenvio = []
        for resultado in job_original.resultados:
            if resultado.status == 'FALHA':
                detalhe = str(resultado.detalhe or '')
                if 'E-mail não preenchido' not in detalhe:
                    titulos_para_reenvio.append(resultado.nr_titulo)

        if not titulos_para_reenvio:
            return {"error": "Nenhuma falha técnica encontrada para reenvio."}, 400

        novo_job_id = manager.start_job(titulos_para_reenvio, current_app._get_current_object())

        return {
            "message": f"Reenvio iniciado para {len(titulos_para_reenvio)} títulos.",
            "job_id": novo_job_id
        }, 200


class StatusAutomacao(Resource):
    def get(self, job_id):
        job = Job.query.get(job_id)
        if not job:
            return {"error": "Job não encontrado"}, 404

        return {
            "status": job.status,
            "total": job.total,
            "concluidos": job.concluidos,
            "resultados": [
                {"nr_titulo": r.nr_titulo, "status": r.status, "detalhe": r.detalhe}
                for r in job.resultados
            ]
        }, 200


class ListarJobs(Resource):
    def get(self):
        # ATUALIZADO: Filtro opcional por tipo via query param ?type=...
        tipo_filtro = request.args.get('type')
        
        query = Job.query
        if tipo_filtro:
            query = query.filter_by(automation_type=tipo_filtro)
            
        jobs = query.order_by(Job.start_time.desc()).all()

        summary = []
        for j in jobs:
            # ... (cálculos de qtd_sucesso, etc iguais) ...
            qtd_sem_email = sum(1 for r in j.resultados if r.status == 'FALHA' and 'E-mail não preenchido' in (r.detalhe or ''))
            qtd_tecnico = sum(1 for r in j.resultados if r.status == 'FALHA' and 'E-mail não preenchido' not in (r.detalhe or ''))
            qtd_sucesso = sum(1 for r in j.resultados if r.status == 'SUCESSO')

            summary.append({
                "job_id": j.id,
                "automation_type": j.automation_type, # Retorna o tipo
                "status": j.status,
                "total": j.total,
                "concluidos": qtd_sucesso,
                "start_time": j.start_time.strftime("%Y-%m-%d %H:%M:%S") if j.start_time else None,
                "end_time": j.end_time.strftime("%Y-%m-%d %H:%M:%S") if j.end_time else None,
                "stats_email": qtd_sem_email,
                "stats_tecnico": qtd_tecnico
            })

        return summary, 200


class DownloadLog(Resource):
    def get(self, job_id):
        job = Job.query.get(job_id)
        if not job: return {"error": "Job 404"}, 404

        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow(['Nr Título', 'Status', 'Detalhe', 'Data'])

        for res in job.resultados:
            writer.writerow([res.nr_titulo, res.status, res.detalhe, job.start_time])

        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=log_job_{job_id}.csv"}
        )