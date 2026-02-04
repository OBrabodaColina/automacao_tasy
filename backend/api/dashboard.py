from flask_restful import Resource
from sqlalchemy import func, case
from datetime import datetime, timedelta
from db.models import db, Job

class DashboardStats(Resource):
    def get(self):
        # Filtro de data (últimos 30 dias para os totais gerais)
        data_corte = datetime.now() - timedelta(days=30)
        
        # 1. Totais Gerais
        total_jobs = Job.query.count()
        
        # 2. Estatísticas por Tipo de Automação
        # Agrupa por automation_type e soma totais e sucessos
        stats_by_type = db.session.query(
            Job.automation_type,
            func.count(Job.id).label('total_execucoes'),
            func.sum(Job.total).label('total_itens_processados'),
            func.sum(Job.concluidos).label('total_sucessos')
        ).group_by(Job.automation_type).all()
        
        # Formata o resultado por tipo
        detalhes = {}
        for row in stats_by_type:
            tipo = row.automation_type or 'BOLETOS' # Fallback para legados
            taxa = 0
            if row.total_itens_processados and row.total_itens_processados > 0:
                taxa = (row.total_sucessos / row.total_itens_processados) * 100
                
            detalhes[tipo] = {
                "execucoes": row.total_execucoes,
                "processados": row.total_itens_processados or 0,
                "sucessos": row.total_sucessos or 0,
                "taxa_sucesso": round(taxa, 1)
            }

        # 3. Gráfico simples (Últimos 7 dias)
        # Retorna quantidade de jobs por dia
        hoje = datetime.now().date()
        grafico = []
        for i in range(6, -1, -1):
            dia = hoje - timedelta(days=i)
            # Conta jobs BOLETOS neste dia
            qtd_boletos = Job.query.filter(
                func.date(Job.start_time) == dia, 
                Job.automation_type == 'BOLETOS'
            ).count()
            
            # Conta jobs RECURSO neste dia
            qtd_recurso = Job.query.filter(
                func.date(Job.start_time) == dia, 
                Job.automation_type == 'RECURSO_PROPRIO'
            ).count()
            
            grafico.append({
                "dia": dia.strftime("%d/%m"),
                "boletos": qtd_boletos,
                "recurso": qtd_recurso
            })

        return {
            "geral_jobs": total_jobs,
            "detalhes": detalhes,
            "grafico_7_dias": grafico
        }, 200