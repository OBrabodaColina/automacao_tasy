import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from config import Config


def gerar_html_relatorio(job_id, dados_job):
    resultados = dados_job['resultados']
    total = dados_job['total']

    itens_processados = []
    for item in resultados:
        # Extração segura de dados
        r_titulo = item.get('nr_titulo') if isinstance(item, dict) else item.nr_titulo
        r_status = item.get('status') if isinstance(item, dict) else item.status
        r_detalhe = item.get('detalhe') if isinstance(item, dict) else getattr(item, 'detalhe', '')

        if r_detalhe is None: r_detalhe = ""

        # Lógica de Classificação
        tipo = 'ERRO'
        if r_status == 'SUCESSO':
            tipo = 'SUCESSO'
        elif 'e-mail não preenchido' in str(r_detalhe).lower():  # Comparação segura
            tipo = 'AVISO'

        itens_processados.append({
            'titulo': r_titulo,
            'status': r_status,
            'tipo': tipo,
            'detalhe': r_detalhe
        })

    # Contadores
    qtd_sucesso = sum(1 for i in itens_processados if i['tipo'] == 'SUCESSO')
    qtd_aviso = sum(1 for i in itens_processados if i['tipo'] == 'AVISO')
    qtd_erro = sum(1 for i in itens_processados if i['tipo'] == 'ERRO')

    # Geração da Tabela
    linhas_tabela = ""
    for item in itens_processados:
        if item['tipo'] == 'SUCESSO':
            badge = '<span style="background:#059669;color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">ENVIADO</span>'
            cor_detalhe = "#9ca3af"
        elif item['tipo'] == 'AVISO':
            badge = '<span style="background:#d97706;color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">SEM E-MAIL</span>'
            cor_detalhe = "#fbbf24"
        else:
            badge = '<span style="background:#dc2626;color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">ERRO</span>'
            cor_detalhe = "#fca5a5"

        linhas_tabela += f"""
        <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 12px; color: #fff; font-family: monospace;">{item['titulo']}</td>
            <td style="padding: 12px; color: {cor_detalhe}; font-size: 13px;">{item['detalhe']}</td>
            <td style="padding: 12px; text-align: right;">{badge}</td>
        </tr>
        """

    # HTML Final
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 800px; margin: 0 auto; background-color: #1f2937; color: #fff; border-radius: 8px; overflow: hidden;">

            <div style="background-color: #00995D; padding: 20px;">
                <h2 style="margin: 0; color: #fff;">Resumo da Execução — Boletos</h2>
                <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Automação Tasy • Unimed Rio Verde</p>
            </div>

            <div style="padding: 20px;">
                <p>Olá, equipe 👋</p>
                <p style="color: #9ca3af; font-size: 14px; margin-bottom: 20px;">Abaixo o consolidado do processamento realizado.</p>

                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <div style="flex: 1; background: #374151; padding: 10px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Total</div>
                        <div style="font-size: 20px; font-weight: bold;">{total}</div>
                    </div>
                    <div style="flex: 1; background: #374151; padding: 10px; border-radius: 6px; text-align: center; border-bottom: 3px solid #059669;">
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Enviados</div>
                        <div style="font-size: 20px; font-weight: bold; color: #34d399;">{qtd_sucesso}</div>
                    </div>
                    <div style="flex: 1; background: #374151; padding: 10px; border-radius: 6px; text-align: center; border-bottom: 3px solid #d97706;">
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Sem E-mail</div>
                        <div style="font-size: 20px; font-weight: bold; color: #fbbf24;">{qtd_aviso}</div>
                    </div>
                    <div style="flex: 1; background: #374151; padding: 10px; border-radius: 6px; text-align: center; border-bottom: 3px solid #dc2626;">
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Falhas</div>
                        <div style="font-size: 20px; font-weight: bold; color: #f87171;">{qtd_erro}</div>
                    </div>
                </div>

                <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>Job ID: #{job_id}</span>
                    <span>Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}</span>
                </div>

                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead style="background: #111827; color: #9ca3af; text-transform: uppercase; font-size: 11px;">
                        <tr>
                            <th style="padding: 10px;">Título</th>
                            <th style="padding: 10px;">Detalhe / Observação</th>
                            <th style="padding: 10px; text-align: right;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas_tabela}
                    </tbody>
                </table>
            </div>

            <div style="background: #111827; padding: 10px; text-align: center; font-size: 11px; color: #4b5563;">
                Mensagem gerada automaticamente pelo Robô de Automação • TI Unimed
            </div>
        </div>
    </body>
    </html>
    """
    return html


def enviar_email(job_id, dados_job):
    try:
        msg = MIMEMultipart()
        msg['From'] = Config.EMAIL_FROM
        msg['To'] = Config.EMAIL_TO
        msg['Subject'] = f"[Resumo] Automação Boletos - Job #{job_id}"

        html = gerar_html_relatorio(job_id, dados_job)
        msg.attach(MIMEText(html, 'html'))

        server = smtplib.SMTP(Config.SMTP_SERVER, int(Config.SMTP_PORT))
        if Config.SMTP_TLS: server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASS)
        server.sendmail(Config.EMAIL_FROM, Config.EMAIL_TO.split(','), msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Erro ao enviar email: {e}")