import logging
import time
import traceback
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from drivers.tasy_login import iniciar_driver, fazer_login

# Configuração de Logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- CONSTANTES DE SELETORES ---
LOCATORS = {
    'INPUT_BUSCA_GLOBAL': (By.XPATH, "//input[@ng-model='search']"),
    'ITEM_FUNCAO': (
        By.XPATH,
        "//span[contains(@class,'w-feature-app__name') and contains(text(),'Manutenção de Títulos a Receber')]"),

    # Filtros e Campos
    'ICON_EXPANDIR_FILTROS': (By.XPATH, "//tasy-wlabel[contains(@class, 'filter-icon')]"),
    'INPUT_NR_TITULO': (By.NAME, "NR_TITULO"),
    'BTN_FILTRAR': (By.XPATH, "//button[contains(@class,'wfilter-button') and contains(text(),'Filtrar')]"),

    # Grid e Alertas
    # --- ATUALIZADO: Seletor específico para o elemento div wrapper da célula ---
    'GRID_LINHA': (By.CSS_SELECTOR, "div.datagrid-cell-content-wrapper"),
    # --------------------------------------------------------------------------
    'BTN_FECHAR_ALERTA': (By.XPATH, "//button[contains(@class, 'btn-gray') and .//span[normalize-space()='Fechar']]"),

    # Menu de Contexto
    'MENU_BOLETOS': (
        By.XPATH, "//div[contains(@class,'wpopupmenu__label') and normalize-space()='Boletos']/parent::li"),
    'SUBMENU_ENVIAR': (By.XPATH, "//li[@uib-tooltip='Enviar por e-mail']"),
    'SUBMENU_ENVIAR_TEXTO': (By.XPATH, "//div[contains(text(), 'Enviar por e-mail')]"),

    # Modal de Envio e Confirmação
    'INPUT_EMAIL_DESTINO': (By.NAME, "DS_RECIPIENT_EMAILS"),
    'BTN_OK_BLUE': (By.XPATH, "//button[contains(@class, 'btn-blue') and .//span[normalize-space()='OK']]"),

    # Finalização
    'MSG_SUCESSO': (By.XPATH, "//div[contains(text(), 'E-mail enviado com sucesso')]"),
    'BTN_OK_FINAL': (By.ID, "w-dialog-box-ok-button"),

    'LOADING_SPINNER': (By.CSS_SELECTOR, ".w-loading-mask")
}


# -------------------- FUNÇÕES DE ESTABILIDADE --------------------

def wait_no_overlays(driver, timeout=10):
    """Garante que nenhum overlay/loading está na tela antes de clicar."""
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".w-loading-mask")) == 0
        )
    except:
        pass
    time.sleep(0.2)


def safe_js_click(driver, locator, timeout=10):
    """Clica via JS somente quando não houver overlay bloqueando."""
    wait_no_overlays(driver)
    element = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(locator))
    driver.execute_script("arguments[0].click();", element)
    time.sleep(0.15)


def safe_js_click_element(driver, element):
    wait_no_overlays(driver)
    driver.execute_script("arguments[0].click();", element)
    time.sleep(0.15)


# -------------------- FUNÇÕES AUXILIARES --------------------

def _navegar_para_funcao(driver, wait):
    logger.info("Navegando para função...")
    search_box = wait.until(EC.element_to_be_clickable(LOCATORS['INPUT_BUSCA_GLOBAL']))
    search_box.clear()
    search_box.send_keys("Manutenção de Títulos a Receber")

    safe_js_click(driver, LOCATORS['ITEM_FUNCAO'])
    wait.until(EC.presence_of_element_located(LOCATORS['ICON_EXPANDIR_FILTROS']))


def _filtrar_titulo(driver, wait, nr_titulo):
    wait_no_overlays(driver)

    # ESC para fechar popups invisíveis
    from selenium.webdriver import ActionChains
    try:
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
    except:
        pass

    # Garantir que campo esteja visível (ou expandir)
    try:
        WebDriverWait(driver, 1).until(EC.visibility_of_element_located(LOCATORS['INPUT_NR_TITULO']))
    except TimeoutException:
        try:
            icone_filtro = driver.find_element(*LOCATORS['ICON_EXPANDIR_FILTROS'])
            safe_js_click_element(driver, icone_filtro)
        except:
            pass

    campo = wait.until(EC.element_to_be_clickable(LOCATORS['INPUT_NR_TITULO']))
    campo.clear()
    campo.send_keys(str(nr_titulo))

    safe_js_click(driver, LOCATORS['BTN_FILTRAR'])

    # Fecha possíveis alertas
    try:
        alert_btn = WebDriverWait(driver, 2).until(
            EC.element_to_be_clickable(LOCATORS['BTN_FECHAR_ALERTA'])
        )
        safe_js_click_element(driver, alert_btn)
    except TimeoutException:
        pass


def _abrir_menu_contexto(driver, wait):
    from selenium.webdriver import ActionChains

    # Aguarda o elemento da linha (div wrapper)
    linha_interna = WebDriverWait(driver, 15).until(EC.presence_of_element_located(LOCATORS['GRID_LINHA']))

    # Movimenta para o elemento e abre o menu de contexto no próprio elemento alvo
    # Pausa curta para garantir que o movimento foi registrado pelo Tasy
    ActionChains(driver).move_to_element(linha_interna).pause(0.1).context_click(linha_interna).perform()

    # Agora seguimos com o fluxo de menu normalmente
    item_boletos = wait.until(EC.visibility_of_element_located(LOCATORS['MENU_BOLETOS']))
    ActionChains(driver).move_to_element(item_boletos).perform()

    try:
        submenu = wait.until(EC.visibility_of_element_located(LOCATORS['SUBMENU_ENVIAR']))
        safe_js_click_element(driver, submenu)
    except:
        submenu = driver.find_element(*LOCATORS['SUBMENU_ENVIAR_TEXTO'])
        safe_js_click_element(driver, submenu)


def _validar_e_confirmar_email(driver, wait):
    campo_email = wait.until(EC.visibility_of_element_located(LOCATORS['INPUT_EMAIL_DESTINO']))
    valor = campo_email.get_attribute("value")

    if not valor or not valor.strip():
        raise ValueError("E-mail não preenchido no cadastro.")

    safe_js_click(driver, LOCATORS['BTN_OK_BLUE'])
    return valor


def _aguardar_conclusao(driver):
    try:
        WebDriverWait(driver, 90).until(
            EC.visibility_of_element_located(LOCATORS['MSG_SUCESSO'])
        )
        logger.info("Mensagem de sucesso detectada.")
    except TimeoutException:
        logger.warning("Mensagem de sucesso demorou, tentando assim mesmo...")

    safe_js_click(driver, LOCATORS['BTN_OK_FINAL'])

    try:
        btn_final = driver.find_element(*LOCATORS['BTN_OK_FINAL'])
        WebDriverWait(driver, 5).until(EC.staleness_of(btn_final))
    except:
        pass

    wait_no_overlays(driver)


# -------------------- FUNÇÃO PRINCIPAL --------------------

def processar_lote_titulos(lista_titulos, on_progress=None):
    """
    Processa uma lista de títulos.
    :param lista_titulos: Lista de IDs
    :param on_progress: Função de callback para reportar progresso (opcional)
    """
    driver = None
    resultados = []
    MAX_RETRIES = 2

    # Variável para rastrear onde o erro aconteceu
    etapa_atual = "Inicialização"

    try:
        logger.info("Iniciando Worker Selenium...")
        driver = iniciar_driver()
        wait = WebDriverWait(driver, 15)

        etapa_atual = "Login"
        fazer_login(driver)

        etapa_atual = "Navegação Inicial"
        _navegar_para_funcao(driver, wait)

        for nr_titulo in lista_titulos:
            res = {"nr_titulo": nr_titulo, "status": "PENDENTE", "detalhe": ""}

            for tentativa in range(1, MAX_RETRIES + 1):
                try:
                    logger.info(f"Título {nr_titulo} - Tentativa {tentativa}")

                    etapa_atual = "Filtrar Título"
                    _filtrar_titulo(driver, wait, nr_titulo)

                    etapa_atual = "Abrir Menu/Boletos"
                    _abrir_menu_contexto(driver, wait)

                    etapa_atual = "Validar E-mail"
                    email_destino = _validar_e_confirmar_email(driver, wait)

                    etapa_atual = "Confirmação Final"
                    _aguardar_conclusao(driver)

                    res["status"] = "SUCESSO"
                    res["detalhe"] = f"Enviado para: {email_destino}"
                    break

                except Exception as e:
                    # Captura mensagem de erro ou cria uma descritiva se estiver vazia
                    msg_erro = str(e).split('\n')[0].strip()
                    if not msg_erro:
                        msg_erro = f"Erro desconhecido ({type(e).__name__})"

                    # Adiciona contexto da etapa
                    erro_formatado = f"[{etapa_atual}] {msg_erro}"
                    logger.error(f"Erro no título {nr_titulo}: {erro_formatado}")

                    # Tentativa de recuperação
                    try:
                        from selenium.webdriver import ActionChains
                        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
                        time.sleep(1)
                    except:
                        pass

                    if "E-mail não preenchido" in msg_erro:
                        res["status"] = "FALHA"
                        res["detalhe"] = erro_formatado
                        break

                    if tentativa == MAX_RETRIES:
                        res["status"] = "FALHA"
                        res["detalhe"] = erro_formatado

            # REPORTA O PROGRESSO EM TEMPO REAL
            if on_progress:
                try:
                    on_progress(res)
                except Exception as cb_err:
                    logger.error(f"Erro ao chamar callback de progresso: {cb_err}")

            resultados.append(res)

    except Exception as e:
        # Tratamento para erro fatal (Crash do driver ou erro de script global)
        msg_crash = str(e).strip() or f"Erro Fatal ({type(e).__name__})"
        msg_final = f"Crash na etapa '{etapa_atual}': {msg_crash}"

        logger.error(msg_final)
        logger.error(traceback.format_exc())

        ids_processados = [r['nr_titulo'] for r in resultados]
        for t in lista_titulos:
            if t not in ids_processados:
                fail_res = {"nr_titulo": t, "status": "FALHA", "detalhe": msg_final}
                resultados.append(fail_res)

                if on_progress:
                    try:
                        on_progress(fail_res)
                    except:
                        pass

    finally:
        if driver:
            driver.quit()

    return resultados