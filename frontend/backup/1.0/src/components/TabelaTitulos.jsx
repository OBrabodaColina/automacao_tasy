import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, Filter, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const getHoje = () => new Date().toISOString().split('T')[0];

// Lista de Origens fornecida
const ORIGENS = [
    { id: '0', label: 'Encontro de contas' },
    { id: '1', label: 'Nota Fiscal' },
    { id: '2', label: 'Conta Paciente' },
    { id: '3', label: 'OPS - Mensalidade' },
    { id: '4', label: 'Negociação de contas a receber' },
    { id: '5', label: 'OPS - Repasse desconto em folha' },
    { id: '6', label: 'OPS - Câmara de compensação' },
    { id: '7', label: 'OPS - Escrituração de quotas' },
    { id: '8', label: 'OPS - Intercâmbio' },
    { id: '9', label: 'Outros' },
    { id: '10', label: 'OPS - Ocorrência financeira' },
    { id: '11', label: 'OPS - Contestações e Recursos de Glosa' },
    { id: '12', label: 'OPS - Pagamento de produção' },
    { id: '13', label: 'OPS - Faturamento' },
    { id: '14', label: 'OPS - Requisição' },
    { id: '15', label: 'Nota de Débito' },
    { id: '16', label: 'Protocolo Convênio' },
    { id: '17', label: 'OPS - Recuperação de reembolso' },
    { id: '18', label: 'OPS - Pagamentos de Produção Médica (Nova)' },
    { id: '19', label: 'OPS - Gestão de Rescisão de Contrato' }
];

const TabelaTitulos = () => {
    const [titulos, setTitulos] = useState([]);

    // 1. Novos campos adicionados ao estado
    const [filtros, setFiltros] = useState({
        nr_titulo: '',
        pessoa: '',
        status: '',
        origem: '',
        tipo_pessoa: '',      // <--- NOVO
        tipo_contratacao: '', // <--- NOVO
        dt_inicio: getHoje(),
        dt_fim: getHoje()
    });

    const [selecionados, setSelecionados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    const navigate = useNavigate();

    const buscarTitulos = async () => {
        setLoading(true);
        try {
            const filtrosLimpos = Object.fromEntries(
                Object.entries(filtros).filter(([_, v]) => v !== '')
            );
            const params = new URLSearchParams(filtrosLimpos).toString();
            const response = await api.get(`/titulos?${params}`);
            setTitulos(response.data);
            setPaginaAtual(1);
            setSelecionados([]);
        } catch (error) {
            console.warn("Erro ao buscar", error);
            setTitulos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { buscarTitulos(); }, []);

    // Lógica de Paginação
    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const titulosAtuais = titulos.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(titulos.length / itensPorPagina);

    const mudarPagina = (numero) => setPaginaAtual(numero);

    const getPaginasVisiveis = () => {
        const maxBotoes = 5;
        let inicio = Math.max(1, paginaAtual - 2);
        let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

        if (fim - inicio < maxBotoes - 1) {
            inicio = Math.max(1, fim - maxBotoes + 1);
        }

        const paginas = [];
        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }
        return paginas;
    };

    const toggleSelecao = (nr_titulo) => {
        setSelecionados(prev =>
            prev.includes(nr_titulo) ? prev.filter(id => id !== nr_titulo) : [...prev, nr_titulo]
        );
    };

    const toggleSelecionarTodos = () => {
        if (selecionados.length === titulos.length && titulos.length > 0) {
            setSelecionados([]);
        } else {
            setSelecionados(titulos.map(t => t.NR_TITULO));
        }
    };

    const executarAutomacao = async () => {
        if (selecionados.length === 0) return alert("Selecione títulos.");
        try {
            const response = await api.post('/executar-automacao', { titulos: selecionados });
            navigate(`/status/${response.data.job_id}`);
        } catch (error) {
            alert("Erro ao iniciar automação.");
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Filter className="w-6 h-6" /> Automação - Envio de boletos por e-mail
            </h2>

            {/* --- ÁREA DE FILTROS --- */}
            {/* 2. Grid alterado para 4 colunas para criar 2 linhas equilibradas (4 itens em cima, 4 em baixo) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 p-6 bg-gray-50 rounded-lg border items-end">

                {/* LINHA 1 */}

                {/* 1. Título */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Número Título</label>
                    <input
                        className="border p-2 rounded text-sm outline-none focus:border-blue-500 w-full"
                        placeholder="Ex: 12345"
                        value={filtros.nr_titulo}
                        onChange={e => setFiltros({...filtros, nr_titulo: e.target.value})}
                    />
                </div>

                {/* 2. Pessoa */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Pessoa</label>
                    <input
                        className="border p-2 rounded text-sm outline-none focus:border-blue-500 w-full"
                        placeholder="Nome ou CPF/CNPJ"
                        value={filtros.pessoa}
                        onChange={e => setFiltros({...filtros, pessoa: e.target.value})}
                    />
                </div>

                {/* 3. Situação */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Situação</label>
                    <select
                        className="border p-2 rounded text-sm bg-white outline-none focus:border-blue-500 w-full"
                        value={filtros.status}
                        onChange={e => setFiltros({...filtros, status: e.target.value})}
                    >
                        <option value="">Todas</option>
                        <option value="Aberto">Aberto</option>
                        <option value="Liquidado">Liquidado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>

                {/* 4. Origem */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Origem</label>
                    <select
                        className="border p-2 rounded text-sm bg-white outline-none focus:border-blue-500 w-full"
                        value={filtros.origem}
                        onChange={e => setFiltros({...filtros, origem: e.target.value})}
                    >
                        <option value="">Todas</option>
                        {ORIGENS.map((origem) => (
                            <option key={origem.id} value={origem.id}>
                                {origem.id} - {origem.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* LINHA 2 */}

                {/* 5. Tipo Pessoa */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Tipo Pessoa</label>
                    <select
                        className="border p-2 rounded text-sm bg-white outline-none focus:border-blue-500 w-full"
                        value={filtros.tipo_pessoa}
                        onChange={e => setFiltros({...filtros, tipo_pessoa: e.target.value})}
                    >
                        <option value="">Todas</option>
                        <option value="Pessoa física">Pessoa física</option>
                        <option value="Pessoa jurídica">Pessoa jurídica</option>
                    </select>
                </div>

                {/* 6. Tipo Contratação */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Tipo Contratação</label>
                    <select
                        className="border p-2 rounded text-sm outline-none focus:border-blue-500 w-full"
                        value={filtros.tipo_contratacao}
                        onChange={e => setFiltros({...filtros, tipo_contratacao: e.target.value})}
                    >
                        <option value="">Todas</option>
                        <option value="I">Individual/Familiar</option>
                        <option value="CE">Coletivo Empresarial</option>
                        <option value="CA">Coletivo por Adesão</option>
                    </select>
                </div>

                {/* 7. Datas */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Vencimento</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            className="border p-2 rounded w-full text-xs outline-none focus:border-blue-500"
                            value={filtros.dt_inicio}
                            onChange={e => setFiltros({...filtros, dt_inicio: e.target.value})}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="border p-2 rounded w-full text-xs outline-none focus:border-blue-500"
                            value={filtros.dt_fim}
                            onChange={e => setFiltros({...filtros, dt_fim: e.target.value})}
                        />
                    </div>
                </div>

                {/* 8. Botão Pesquisar */}
                <button
                    onClick={buscarTitulos}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 h-10 w-full shadow-md transition-transform active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Pesquisar'}
                </button>
            </div>

            {/* --- TABELA --- */}
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div>
            ) : (
                <>
                    <div className="overflow-x-auto border rounded-lg min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-3 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={titulos.length > 0 && selecionados.length === titulos.length}
                                            onChange={toggleSelecionarTodos}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-3">Título</th>
                                    <th className="p-3">Pessoa / CPF-CNPJ</th>
                                    <th className="p-3">Origem</th>
                                    <th className="p-3">Vencimento</th>
                                    <th className="p-3 text-right">Saldo</th>
                                    <th className="p-3">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {titulosAtuais.length > 0 ? titulosAtuais.map((t) => (
                                    <tr key={t.NR_TITULO} className={`hover:bg-blue-50 transition-colors ${selecionados.includes(t.NR_TITULO) ? 'bg-blue-50' : ''}`}>
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selecionados.includes(t.NR_TITULO)}
                                                onChange={() => toggleSelecao(t.NR_TITULO)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-3 font-mono">{t.NR_TITULO}</td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-900">{t.NM_PESSOA}</div>
                                            <div className="text-xs text-gray-500">{t.DS_CPF_CNPJ}</div>
                                        </td>
                                        <td className="p-3 text-gray-600">
                                            {ORIGENS.find(o => o.id == t.IE_ORIGEM_TITULO)?.label || t.DS_ORIGEM || '-'}
                                        </td>
                                        <td className="p-3">
                                            {t.DT_VENCIMENTO ? new Date(t.DT_VENCIMENTO).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-3 text-right font-mono">
                                            {t.VL_SALDO_TITULO ? Number(t.VL_SALDO_TITULO).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '0,00'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                String(t.DS_STATUS_TITULO).toLowerCase().includes('aberto')
                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            }`}>
                                                {t.DS_STATUS_TITULO}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            Nenhum título encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação Estilo Clean */}
                    {titulos.length > 0 && (
                        <div className="flex flex-col md:flex-row items-center justify-between mt-4 border-t border-gray-200 pt-4 gap-4">

                            <span className="text-sm text-gray-600">
                                Mostrando <span className="font-bold text-gray-900">{indexPrimeiro + 1}</span> a <span className="font-bold text-gray-900">{Math.min(indexUltimo, titulos.length)}</span> de <span className="font-bold text-gray-900">{titulos.length}</span> resultados
                            </span>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => mudarPagina(paginaAtual - 1)}
                                    disabled={paginaAtual === 1}
                                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {getPaginasVisiveis().map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => mudarPagina(num)}
                                        className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                                            paginaAtual === num
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    onClick={() => mudarPagina(paginaAtual + 1)}
                                    disabled={paginaAtual === totalPaginas}
                                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                     <div className="mt-4 flex justify-end">
                        <button 
                            onClick={executarAutomacao} 
                            disabled={selecionados.length === 0}
                            className={`px-6 py-2 rounded text-white flex items-center gap-2 font-medium shadow-sm transition-all ${selecionados.length ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <Play className="w-4 h-4" /> 
                            Executar ({selecionados.length} selecionados)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TabelaTitulos;