import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Loader2, Filter, Play, ChevronLeft, ChevronRight,
    Search, User, FileText, CheckCircle2
} from 'lucide-react';

const getHoje = () => new Date().toISOString().split('T')[0];

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

// Componente visual de Input reutilizável (Com suporte Dark Mode reforçado)
const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group w-full">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />}
        <input
            {...props}
            className={`flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white dark:ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${Icon ? 'pl-9' : ''}`}
        />
    </div>
);

// Componente visual de Select reutilizável (Com suporte Dark Mode reforçado)
const SelectField = (props) => (
    <div className="relative w-full">
        <select
            {...props}
            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
        />
        <div className="absolute right-3 top-3 pointer-events-none">
            <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
);

// Componente de Badge (Com suporte Dark Mode reforçado)
const Badge = ({ children }) => {
    const styles = {
        success: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20",
        warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        danger: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
        default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    };

    let style = styles.default;
    const text = String(children || '').toLowerCase();

    if (text.includes('aberto')) style = styles.success;
    if (text.includes('liquidado')) style = styles.default;
    if (text.includes('cancelado')) style = styles.danger;

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${style}`}>
            {children}
        </span>
    );
};

// --- Componente Principal ---

const TabelaTitulos = () => {
    const [titulos, setTitulos] = useState([]);
    const [filtros, setFiltros] = useState({
        nr_titulo: '', pessoa: '', status: 'Aberto', origem: '',
        tipo_pessoa: '', tipo_contratacao: '',
        dt_inicio: getHoje(), dt_fim: getHoje()
    });
    const [selecionados, setSelecionados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    const navigate = useNavigate();

    const buscarTitulos = async () => {
        setLoading(true);
        try {
            const filtrosLimpos = Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v !== ''));
            const params = new URLSearchParams(filtrosLimpos).toString();
            const response = await api.get(`/titulos?${params}`);
            setTitulos(response.data);
            setPaginaAtual(1);
            setSelecionados([]);

            if(response.data.length > 0) {
                toast.success(`${response.data.length} títulos encontrados.`);
            } else {
                toast.info("Nenhum título encontrado com os filtros atuais.");
            }
        } catch (error) {
            toast.error("Erro ao buscar títulos. Verifique a conexão.");
            console.error(error);
            setTitulos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { buscarTitulos(); }, []);

    // Paginação
    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const titulosAtuais = titulos.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(titulos.length / itensPorPagina);

    const toggleSelecao = (nr) => {
        setSelecionados(prev => prev.includes(nr) ? prev.filter(id => id !== nr) : [...prev, nr]);
    };

    const toggleTodos = () => {
        selecionados.length === titulos.length && titulos.length > 0
            ? setSelecionados([])
            : setSelecionados(titulos.map(t => t.NR_TITULO));
    };

    const executarAutomacao = async () => {
        if (selecionados.length === 0) return toast.warning("Selecione pelo menos um título para processar.");

        const promise = api.post('/executar-automacao', { titulos: selecionados });

        toast.promise(promise, {
            loading: 'Iniciando robô de automação...',
            success: (data) => {
                navigate(`/status/${data.data.job_id}`);
                return 'Automação iniciada com sucesso!';
            },
            error: 'Falha ao iniciar automação.'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header e Ações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Gerenciamento de Boletos</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Filtre os títulos e dispare o envio automatizado de e-mails.</p>
                </div>
                <button
                    onClick={executarAutomacao}
                    disabled={selecionados.length === 0}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-900/90 dark:hover:bg-blue-700 h-10 px-6 py-2 shadow-sm"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Executar ({selecionados.length})
                </button>
            </div>

            {/* Card de Filtros */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                    <Filter className="w-4 h-4" /> Filtros de Busca
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField
                        icon={Search} placeholder="Número Título"
                        value={filtros.nr_titulo} onChange={e => setFiltros({...filtros, nr_titulo: e.target.value})}
                    />
                    <InputField
                        icon={User} placeholder="Nome ou CPF/CNPJ"
                        value={filtros.pessoa} onChange={e => setFiltros({...filtros, pessoa: e.target.value})}
                    />

                    <SelectField value={filtros.status} onChange={e => setFiltros({...filtros, status: e.target.value})}>
                        <option value="">Todas as situações</option>
                        <option value="Aberto">Aberto</option>
                        <option value="Liquidado">Liquidado</option>
                        <option value="Cancelado">Cancelado</option>
                    </SelectField>

                    <SelectField value={filtros.origem} onChange={e => setFiltros({...filtros, origem: e.target.value})}>
                        <option value="">Todas as origens</option>
                        {ORIGENS.map(o => <option key={o.id} value={o.id}>{o.id} - {o.label}</option>)}
                    </SelectField>

                    {/* Linha 2 */}
                    <SelectField value={filtros.tipo_pessoa} onChange={e => setFiltros({...filtros, tipo_pessoa: e.target.value})}>
                        <option value="">Tipo Pessoa (Todas)</option>
                        <option value="Pessoa física">Pessoa física</option>
                        <option value="Pessoa jurídica">Pessoa jurídica</option>
                    </SelectField>

                    <SelectField value={filtros.tipo_contratacao} onChange={e => setFiltros({...filtros, tipo_contratacao: e.target.value})}>
                        <option value="">Contratação (Todas)</option>
                        <option value="I">Individual/Familiar</option>
                        <option value="CE">Coletivo Empresarial</option>
                        <option value="CA">Coletivo por Adesão</option>
                    </SelectField>

                    <div className="grid grid-cols-2 gap-1 col-span-1 md:col-span-1 w-full">
                        <InputField type="date" value={filtros.dt_inicio} onChange={e => setFiltros({...filtros, dt_inicio: e.target.value})} />
                        <InputField type="date" value={filtros.dt_fim} onChange={e => setFiltros({...filtros, dt_fim: e.target.value})} />
                    </div>

                    <button
                        onClick={buscarTitulos}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors p-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 h-10 w-full disabled:opacity-70 shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Search className="w-4 h-4 mr-2"/>}
                        Pesquisar
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="h-12 px-4 text-center w-12">
                                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 cursor-pointer"
                                        checked={titulos.length > 0 && selecionados.length === titulos.length}
                                        onChange={toggleTodos}
                                    />
                                </th>
                                <th className="h-12 px-4 font-medium">Título</th>
                                <th className="h-12 px-4 font-medium">Pessoa</th>
                                <th className="h-12 px-4 font-medium">Origem</th>
                                <th className="h-12 px-4 font-medium">Vencimento</th>
                                <th className="h-12 px-4 font-medium text-right">Saldo</th>
                                <th className="h-12 px-4 font-medium">Situação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                // Skeleton Loader
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div><div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                        <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                                    </tr>
                                ))
                            ) : titulosAtuais.length > 0 ? (
                                titulosAtuais.map((t) => (
                                    <tr
                                        key={t.NR_TITULO}
                                        onClick={() => toggleSelecao(t.NR_TITULO)}
                                        className={`transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selecionados.includes(t.NR_TITULO) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                                                checked={selecionados.includes(t.NR_TITULO)}
                                                onChange={() => toggleSelecao(t.NR_TITULO)}
                                            />
                                        </td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{t.NR_TITULO}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{t.NM_PESSOA}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">{t.DS_CPF_CNPJ}</div>
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                                            {ORIGENS.find(o => o.id == t.IE_ORIGEM_TITULO)?.label || t.DS_ORIGEM || '-'}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {t.DT_VENCIMENTO ? new Date(t.DT_VENCIMENTO).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-4 text-right font-medium text-slate-900 dark:text-white">
                                            {t.VL_SALDO_TITULO ? Number(t.VL_SALDO_TITULO).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '0,00'}
                                        </td>
                                        <td className="p-4">
                                            <Badge>{t.DS_STATUS_TITULO}</Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="h-32 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum título encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer da Tabela (Paginação) */}
                {!loading && titulos.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Mostrando <strong className="text-slate-700 dark:text-slate-200">{indexPrimeiro + 1}</strong> a <strong className="text-slate-700 dark:text-slate-200">{Math.min(indexUltimo, titulos.length)}</strong> de <strong className="text-slate-700 dark:text-slate-200">{titulos.length}</strong>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1}
                                className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft className="w-4 h-4"/>
                            </button>
                            <span className="px-4 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center bg-white dark:bg-slate-700 border dark:border-slate-600 rounded shadow-sm">
                                {paginaAtual} / {totalPaginas}
                            </span>
                            <button
                                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas}
                                className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabelaTitulos;