import time
import logging
import traceback
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from drivers.tasy_login import iniciar_driver, fazer_login

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Seletores
LOCATORS_RP = {
    'BTN_AVATAR': (By.CLASS_NAME, "w-header-avatar__title"),
    'BTN_ESTAB_ATUAL': (By.CLASS_NAME, "w-header-option__value"),
    
    # 1. Container do Modal (para garantir que carregou)
    'MODAL_CONTAINER': (By.CLASS_NAME, "ngdialog-content"),
    
    # 2. A Caixa de Seleção do Estabelecimento (A segunda div dropdown da tela)
    #    [1] seria a Empresa, [2] é o Estabelecimento.
    'DROPDOWN_ESTAB_BOX': (By.XPATH, "(//div[contains(@class, 'w-listbox-dropdown')])[2]"),
    
    # 3. A Opção na Lista (Texto exato)
    'OPTION_HOSPITAL': (By.XPATH, "//span[contains(text(), 'Hospital Unimed Rio Verde')]"),
    
    # 4. Botão OK
    'BTN_OK_MODAL': (By.XPATH, "//div[contains(@class, 'ngdialog-content')]//button[normalize-space()='Ok']"),

    'INPUT_BUSCA_GLOBAL': (By.XPATH, "//input[@ng-model='search']"),
    'ITEM_FUNCAO_AUTORIZACAO': (By.XPATH, "//span[contains(@class,'w-feature-app__name') and normalize-space()='Autorização Convênio']"),
    'BTN_ABRIR_FILTRO': (By.XPATH, "//div[contains(@class, 'w-label-container__empty-text')]"), 
    'INPUT_NR_SEQUENCIA': (By.NAME, "NR_SEQUENCIA"),
    'BTN_FILTRAR': (By.XPATH, "//button[contains(text(), 'Filtrar')]"),
    'LOADING': (By.CSS_SELECTOR, ".w-loading-mask")
}

def wait_loading(driver):
    try:
        WebDriverWait(driver, 5).until(EC.invisibility_of_element_located(LOCATORS_RP['LOADING']))
    except: pass

def force_click(driver, element):
    """Clica via JS para garantir execução mesmo com overlays"""
    driver.execute_script("arguments[0].click();", element)
    time.sleep(0.5)

def trocar_estabelecimento(driver, wait):
    logger.info("Etapa: Trocando Estabelecimento (Seleção Direta)...")
    wait_loading(driver)
    
    # 1. Abre menu do usuário
    try:
        btn_avatar = wait.until(EC.element_to_be_clickable(LOCATORS_RP['BTN_AVATAR']))
        btn_avatar.click()
        time.sleep(1.5) 
    except Exception as e:
        logger.error(f"Erro ao clicar no avatar: {e}")
        raise

    # 2. Clica no estabelecimento atual para abrir o modal
    try:
        btn_estab = wait.until(EC.presence_of_element_located(LOCATORS_RP['BTN_ESTAB_ATUAL']))
        force_click(driver, btn_estab)
        time.sleep(2)
    except Exception as e:
        logger.error(f"Erro ao abrir modal: {e}")
        raise
    
    # 3. Navegação no Modal
    try:
        # Garante que o modal carregou
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located(LOCATORS_RP['MODAL_CONTAINER']))
        logger.info("Modal detectado.")
        
        # --- PASSO A: ABRIR A LISTA ---
        logger.info("Clicando na caixa do Estabelecimento (Index 2)...")
        dropdown_box = wait.until(EC.element_to_be_clickable(LOCATORS_RP['DROPDOWN_ESTAB_BOX']))
        force_click(driver, dropdown_box)
        
        # Espera a lista renderizar (Crucial no Tasy)
        time.sleep(2.5) 
        
        # --- PASSO B: SELECIONAR A OPÇÃO ---
        logger.info("Procurando opção 'Hospital Unimed Rio Verde'...")
        try:
            # Procura pelo texto. Se a lista for longa, o JS scrolla automaticamente se necessário.
            opcao = wait.until(EC.presence_of_element_located(LOCATORS_RP['OPTION_HOSPITAL']))
            
            # Clica na opção
            force_click(driver, opcao)
            logger.info("Opção Selecionada.")
            time.sleep(1.5) # Espera o valor ser preenchido no campo
            
        except Exception as e:
            logger.error(f"Não foi possível encontrar a opção na lista: {e}")
            raise # Para aqui se não achar o hospital, não clica em OK

        # --- PASSO C: CONFIRMAR ---
        logger.info("Clicando em OK...")
        btn_ok = driver.find_element(*LOCATORS_RP['BTN_OK_MODAL'])
        force_click(driver, btn_ok)

        time.sleep(5) 
        wait_loading(driver)
        logger.info("Estabelecimento Trocado com Sucesso.")

    except Exception as e:
        logger.error(f"Erro crítico no modal: {e}")
        # Tenta salvar print
        try: driver.save_screenshot("erro_selecao_estab.png")
        except: pass
        raise

def processar_autorizacao(driver, wait, nr_sequencia):
    logger.info("Buscando função Autorização Convênio...")
    search = wait.until(EC.element_to_be_clickable(LOCATORS_RP['INPUT_BUSCA_GLOBAL']))
    search.clear()
    search.send_keys("Autorização Convênio")
    
    func_btn = wait.until(EC.element_to_be_clickable(LOCATORS_RP['ITEM_FUNCAO_AUTORIZACAO']))
    func_btn.click()
    
    wait_loading(driver)
    time.sleep(2) 
    
    logger.info(f"Filtrando sequência {nr_sequencia}...")
    try:
        inp_seq = driver.find_element(*LOCATORS_RP['INPUT_NR_SEQUENCIA'])
        if not inp_seq.is_displayed(): raise Exception("Oculto")
    except:
        filtros = driver.find_elements(*LOCATORS_RP['BTN_ABRIR_FILTRO'])
        if filtros: 
            force_click(driver, filtros[0])
    
    inp_seq = wait.until(EC.visibility_of_element_located(LOCATORS_RP['INPUT_NR_SEQUENCIA']))
    inp_seq.clear()
    inp_seq.send_keys(str(nr_sequencia))
    
    btn_filtrar = driver.find_element(*LOCATORS_RP['BTN_FILTRAR'])
    force_click(driver, btn_filtrar)
    
    wait_loading(driver)
    time.sleep(2)
    
    logger.info("Enviando comando Ctrl+F10...")
    actions = ActionChains(driver)
    actions.key_down(Keys.CONTROL).send_keys(Keys.F10).key_up(Keys.CONTROL).perform()
    time.sleep(3)
    
    return "Comando Ctrl+F10 enviado"

def worker_recurso_proprio(lista_itens, on_progress=None):
    driver = None
    resultados = []
    etapa = "Inicialização"

    try:
        etapa = "Iniciar Driver"
        driver = iniciar_driver()
        wait = WebDriverWait(driver, 20)
        
        etapa = "Login"
        fazer_login(driver)
        
        etapa = "Troca Estabelecimento"
        trocar_estabelecimento(driver, wait)
        
        for item in lista_itens:
            nr_seq = item['nr_sequencia']
            res = {
                "nr_titulo": nr_seq, 
                "status": "PENDENTE", 
                "detalhe": "",
                "nm_paciente": item.get('nm_paciente'),
                "nr_atendimento": item.get('nr_atendimento')
            }

            try:
                etapa = f"Processando Seq {nr_seq}"
                msg = processar_autorizacao(driver, wait, nr_seq)
                res["status"] = "SUCESSO"
                res["detalhe"] = msg
            except Exception as e:
                logger.error(f"Erro seq {nr_seq}: {e}")
                res["status"] = "FALHA"
                res["detalhe"] = str(e)[:150]
                
                try:
                    driver.refresh()
                    wait_loading(driver)
                    time.sleep(2)
                except: pass
            
            resultados.append(res)
            if on_progress: on_progress(res)
            
    except Exception as e:
        msg_fatal = f"Erro Fatal na etapa '{etapa}': {str(e)}"
        logger.error(msg_fatal)
        logger.error(traceback.format_exc())
        
        ids_ja_processados = [r['nr_titulo'] for r in resultados]
        for item in lista_itens:
            if item['nr_sequencia'] not in ids_ja_processados:
                fail_res = {
                    "nr_titulo": item['nr_sequencia'],
                    "status": "FALHA",
                    "detalhe": msg_fatal,
                    "nm_paciente": item.get('nm_paciente'),
                    "nr_atendimento": item.get('nr_atendimento')
                }
                resultados.append(fail_res)
                if on_progress:
                    try: on_progress(fail_res)
                    except: pass

    finally:
        if driver: driver.quit()
        
    return resultados