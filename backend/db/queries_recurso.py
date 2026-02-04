import oracledb
from db.connection import get_db_connection

def buscar_autorizacoes_recurso(filtros):
    conn = None
    cursor = None
    
    # Query fornecida (ajustada para bind variables do Oracle :dt_inicio, :dt_fim)
    sql = """
    SELECT
        a.nr_sequencia, 
        SUBSTR(
             NVL(obter_nome_pf_pj(cd_pessoa_fisica,NULL),
                 NVL(NVL(obter_pessoa_atendimento(nr_atendimento,'N'),
                         NVL(obter_nome_paciente_agenda(nr_seq_agenda),
                             NVL(obter_paciente_agenda_consulta(nr_seq_agenda_consulta),
                                 obter_paciente_autor_onc(nr_seq_paciente_setor)
                             )
                         )
                     ),
                     obter_paciente_gestao_vagas(nr_seq_gestao,'N')
                 )
             ),
             1,254
        ) AS nm_paciente,
        a.nr_atendimento,
        SUBSTR(obter_nome_convenio(cd_convenio),1,100) AS ds_convenio,
        SUBSTR(obter_nome_medico(cd_medico_solicitante,'MAT'),1,100) AS nm_medico_solicitante,
        obter_dados_atendimento_DT(a.nr_atendimento,'DA') AS dt_alta,
        SUBSTR(obter_tipo_atend_autor(a.nr_atendimento,a.nr_seq_agenda,a.nr_seq_agenda_consulta,a.nr_seq_age_integ,a.nr_seq_paciente_setor,'D'),1,50) AS ds_tipo_atendimento,
        SUBSTR(obter_valor_dominio(1031,ie_tipo_guia),1,254) AS ds_tipo_guia,
        SUBSTR(obter_descricao_padrao('ESTAGIO_AUTORIZACAO','DS_ESTAGIO',nr_seq_estagio),1,254) AS ds_estagio,
        SUBSTR(obter_valor_dominio(1377,ie_tipo_autorizacao),1,254) AS ds_tipo_autorizacao
    FROM autorizacao_convenio a
    WHERE a.nr_seq_estagio = 4
      AND a.dt_autorizacao BETWEEN TO_DATE(:dt_inicio, 'YYYY-MM-DD') AND TO_DATE(:dt_fim, 'YYYY-MM-DD')
      AND a.cd_estabelecimento = 1
      AND a.cd_convenio IN (5, 17)
      AND obter_tipo_atendimento(a.nr_atendimento) IN (3)
      AND a.ie_tipo_autorizacao IN (3)
    """

    # Adiciona filtro de nr_sequencia se informado na busca
    if filtros.get('nr_sequencia'):
        sql += " AND a.nr_sequencia = :nr_sequencia"

    sql += " ORDER BY a.nr_sequencia DESC"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        params = {
            'dt_inicio': filtros.get('dt_inicio'),
            'dt_fim': filtros.get('dt_fim')
        }
        
        if filtros.get('nr_sequencia'):
            params['nr_sequencia'] = filtros['nr_sequencia']

        cursor.execute(sql, params)
        
        columns = [col[0] for col in cursor.description]
        cursor.rowfactory = lambda *args: dict(zip(columns, args))
        data = cursor.fetchall()
        return data
    except Exception as e:
        print(f"Erro query recurso proprio: {e}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()