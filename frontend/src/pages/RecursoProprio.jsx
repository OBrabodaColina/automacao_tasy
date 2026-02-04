import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    Loader2, Search, Play, Calendar, Filter, 
    FileText, CheckCircle2 
} from 'lucide-react';

// --- COMPONENTES VISUAIS (Padrão TabelaTitulos) ---

const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group w-full">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />}
        <input
            {...props}
            className={`flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white dark:ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${Icon ? 'pl-9' : ''}`}
        />
    </div>
);

const Badge = ({ children, color = 'default' }) => {
    const styles = {
        success: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20",
        blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${styles[color] || styles.default}`}>
            {children}
        </span>
    );
};

// --- PÁGINA PRINCIPAL ---

const RecursoProprio = () => {
    const navigate = useNavigate();
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selecionados, setSelecionados] = useState([]);
    
    const hoje = new Date().toISOString().split('T')[0];
    const [filtros, setFiltros] = useState({
        dt_inicio: hoje,
        dt_fim: hoje,
        nr_sequencia: ''
    });

    const buscar = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filtros).toString();
            const res = await api.get(`/recurso-proprio/listar?${params}`);
            setDados(res.data);
            setSelecionados([]);
            
            if(res.data.length > 0) {
                toast.success(`${res.data.length} autorizações encontradas.`);
            } else {
                toast.info("Nenhum registro encontrado.");
            }
        } catch (error) {
            toast.error("Erro ao buscar dados. Verifique a conexão.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { buscar(); }, []);

    const toggleSelecao = (id) => {
        setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleTodos = () => {
        if (selecionados.length === dados.length && dados.length > 0) setSelecionados([]);
        else setSelecionados(dados.map(d => d.NR_SEQUENCIA));
    };

    const executar = async () => {
        if (selecionados.length === 0) return toast.warning("Selecione itens.");
        
        // Filtra os objetos completos baseados nos IDs selecionados
        const itensParaEnvio = dados
            .filter(d => selecionados.includes(d.NR_SEQUENCIA))
            .map(d => ({
                nr_sequencia: d.NR_SEQUENCIA,
                nm_paciente: d.NM_PACIENTE,
                nr_atendimento: d.NR_ATENDIMENTO
            }));

        try {
            // Nota: mudei a chave de 'sequencias' para 'itens'
            const res = await api.post('/recurso-proprio/executar', { itens: itensParaEnvio });
            toast.success("Automação Iniciada!");
            // Redireciona para a NOVA tela de status
            navigate(`/status-recurso/${res.data.job_id}`);
        } catch (error) {
            toast.error("Erro ao iniciar.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header e Ações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Recurso Próprio</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Automação de Autorização Convênio (Estágio 4).</p>
                </div>
                <button
                    onClick={executar}
                    disabled={selecionados.length === 0}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-900/90 dark:hover:bg-blue-700 h-10 px-6 py-2 shadow-sm"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Executar ({selecionados.length})
                </button>
            </div>

            {/* Card de Filtros (Padrão Unificado) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                    <Filter className="w-4 h-4" /> Filtros de Busca
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Input Nr Sequencia */}
                    <div className="col-span-1">
                        <InputField
                            icon={FileText} 
                            placeholder="Nº Sequência"
                            type="number"
                            value={filtros.nr_sequencia} 
                            onChange={e => setFiltros({...filtros, nr_sequencia: e.target.value})}
                        />
                    </div>

                    {/* Input Datas */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <InputField 
                            type="date" 
                            icon={Calendar}
                            value={filtros.dt_inicio} 
                            onChange={e => setFiltros({...filtros, dt_inicio: e.target.value})} 
                        />
                        <InputField 
                            type="date" 
                            icon={Calendar}
                            value={filtros.dt_fim} 
                            onChange={e => setFiltros({...filtros, dt_fim: e.target.value})} 
                        />
                    </div>

                    {/* Botão Pesquisar */}
                    <div className="col-span-1">
                        <button
                            onClick={buscar}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-md font-medium transition-colors p-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 h-10 w-full disabled:opacity-70 shadow-sm"
                        >
                            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Search className="w-4 h-4 mr-2"/>}
                            Pesquisar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela de Resultados */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="h-12 px-4 text-center w-12">
                                    <input type="checkbox" 
                                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 cursor-pointer"
                                        checked={dados.length > 0 && selecionados.length === dados.length} 
                                        onChange={toggleTodos}
                                    />
                                </th>
                                <th className="h-12 px-4 font-medium">Sequência</th>
                                <th className="h-12 px-4 font-medium">Paciente</th>
                                <th className="h-12 px-4 font-medium">Convênio</th>
                                <th className="h-12 px-4 font-medium">Atendimento</th>
                                <th className="h-12 px-4 font-medium">Médico</th>
                                <th className="h-12 px-4 font-medium">Alta</th>
                                <th className="h-12 px-4 font-medium">Estágio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                // Skeleton Loader Simples
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4" colSpan="8"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                    </tr>
                                ))
                            ) : dados.length > 0 ? (
                                dados.map(row => (
                                    <tr 
                                        key={row.NR_SEQUENCIA} 
                                        onClick={() => toggleSelecao(row.NR_SEQUENCIA)}
                                        className={`transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selecionados.includes(row.NR_SEQUENCIA) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" 
                                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                                                checked={selecionados.includes(row.NR_SEQUENCIA)} 
                                                onChange={() => toggleSelecao(row.NR_SEQUENCIA)}
                                            />
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-200">{row.NR_SEQUENCIA}</td>
                                        <td className="p-4 max-w-[200px] truncate" title={row.NM_PACIENTE}>{row.NM_PACIENTE}</td>
                                        <td className="p-4 max-w-[150px] truncate">{row.DS_CONVENIO}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{row.NR_ATENDIMENTO}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{row.DS_TIPO_ATENDIMENTO}</div>
                                        </td>
                                        <td className="p-4 max-w-[150px] truncate">{row.NM_MEDICO_SOLICITANTE}</td>
                                        <td className="p-4">{row.DT_ALTA ? new Date(row.DT_ALTA).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="p-4">
                                            <Badge color="blue">{row.DS_ESTAGIO}</Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="h-32 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum registro encontrado para os filtros informados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Rodapé simples de contagem */}
                {!loading && dados.length > 0 && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                        Total de <strong>{dados.length}</strong> registros encontrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecursoProprio;