from flask import request
from flask_restful import Resource
from db.queries_recurso import buscar_autorizacoes_recurso
from datetime import datetime
from flask import current_app
import threading
import json
from db.models import db, Job, JobResult
from drivers.tasy_recurso_proprio import worker_recurso_proprio

# Helper de serialização
def serialize(row):
    return {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in row.items()}

class ListarAutorizacoes(Resource):
    def get(self):
        filtros = {
            'dt_inicio': request.args.get('dt_inicio'),
            'dt_fim': request.args.get('dt_fim'),
            'nr_sequencia': request.args.get('nr_sequencia')
        }
        
        try:
            dados = buscar_autorizacoes_recurso(filtros)
            return [serialize(row) for row in dados], 200
        except Exception as e:
            return {"error": str(e)}, 500

class ExecutarAutomacaoRecurso(Resource):
    def post(self):
        data = request.json
        # Agora esperamos 'itens' que são os objetos completos da tabela
        itens = data.get('itens', [])
        
        if not itens: return {"error": "Lista vazia"}, 400
        
        # Define o automation_type para separar nos relatórios
        new_job = Job(total=len(itens), status="EM_ANDAMENTO", automation_type="RECURSO_PROPRIO")
        db.session.add(new_job)
        db.session.commit()
        
        app = current_app._get_current_object()
        
        def run_thread(job_id, lista_itens):
            with app.app_context():
                def cb_progresso(res):
                    with app.app_context():
                        try:
                            # CRUCIAL: Empacota os dados extras no campo 'detalhe' como JSON
                            detalhe_json = json.dumps({
                                "msg": res['detalhe'],
                                "paciente": res.get('nm_paciente'),
                                "atendimento": res.get('nr_atendimento')
                            })

                            db.session.add(JobResult(
                                job_id=job_id,
                                nr_titulo=str(res['nr_titulo']),
                                status=res['status'],
                                detalhe=detalhe_json # Salva o JSON string
                            ))
                            Job.query.filter_by(id=job_id).update({'concluidos': Job.concluidos + 1})
                            db.session.commit()
                        except Exception as e: 
                            print(f"Erro ao salvar progresso: {e}")

                try:
                    worker_recurso_proprio(lista_itens, cb_progresso)
                    job = Job.query.get(job_id)
                    job.status = "CONCLUIDO"
                    job.end_time = datetime.now()
                    db.session.commit()
                except Exception as e:
                    print(f"Erro Thread: {e}")

        threading.Thread(target=run_thread, args=(new_job.id, itens)).start()
        
        return {"job_id": new_job.id, "message": "Iniciado"}, 202