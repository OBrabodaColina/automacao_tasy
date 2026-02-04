import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, AlertTriangle, RefreshCcw } from 'lucide-react';

const AutomacaoStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState(false);
    const [retrying, setRetrying] = useState(false); // Estado para loading do botão reenvio

    useEffect(() => {
        let isMounted = true;
        let intervalId = null;

        const fetchData = async () => {
            try {
                const response = await api.get(`/status-automacao/${id}`);

                if (isMounted) {
                    setStatusData(response.data);

                    if (response.data.status === 'CONCLUIDO') {
                        if (intervalId) clearInterval(intervalId);
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar status:", err);
                if(err.response && err.response.status !== 401) {
                     setError(true);
                     if (intervalId) clearInterval(intervalId);
                }
            }
        };

        fetchData();
        intervalId = setInterval(fetchData, 2000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [id]);

    const handleReenviarFalhas = async () => {
        setRetrying(true);
        try {
            const response = await api.post(`/jobs/${id}/retry`);
            toast.success("Novo Job de reenvio criado!");
            // Redireciona para a tela de status do NOVO job
            navigate(`/status/${response.data.job_id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao reenviar falhas.");
            setRetrying(false);
        }
    };

    if (error) return (
        <div className="flex flex-col items-center justify-center h-96">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-slate-600 font-medium">Não foi possível carregar o status do Job.</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">Voltar</Link>
        </div>
    );

    if (!statusData) return (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">Conectando ao worker...</p>
        </div>
    );

    const progress = statusData.total > 0 ? (statusData.concluidos / statusData.total) * 100 : 0;
    const isDone = statusData.status === 'CONCLUIDO';

    // Conta falhas técnicas (ignora regra de negócio 'E-mail não preenchido')
    const falhasTecnicas = statusData.resultados?.filter(
        r => r.status === 'FALHA' && !r.detalhe?.includes('E-mail não preenchido')
    ).length || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Status */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {isDone ? <CheckCircle2 className="text-emerald-500"/> : <Loader2 className="animate-spin text-blue-500"/>}
                            {isDone ? 'Execução Finalizada' : 'Processando Fila...'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            Job ID: <span className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{id}</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Botão de Reenviar Falhas (Só aparece se acabou e tem falhas reais) */}
                        {isDone && falhasTecnicas > 0 && (
                            <button
                                onClick={handleReenviarFalhas}
                                disabled={retrying}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors disabled:opacity-50"
                            >
                                {retrying ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCcw className="w-3 h-3"/>}
                                Reenviar {falhasTecnicas} Falhas
                            </button>
                        )}

                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border h-fit ${
                            isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                            {statusData.status}
                        </span>
                    </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span>Progresso: {statusData.concluidos} / {statusData.total}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-700 ease-out rounded-full ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Lista de Resultados */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Log de Execução</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mostrando últimos eventos</span>
                </div>
                <div className="max-h-[500px] overflow-auto scroll-smooth">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 sticky top-0 shadow-sm">
                            <tr>
                                <th className="p-4 font-medium w-32">Título</th>
                                <th className="p-4 font-medium w-32">Status</th>
                                <th className="p-4 font-medium">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {statusData.resultados?.map((res, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300 font-medium">{res.nr_titulo}</td>
                                    <td className="p-4">
                                        {res.status === 'SUCESSO' ?
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                                <CheckCircle2 className="w-3 h-3"/> Sucesso
                                            </span> :
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">
                                                <XCircle className="w-3 h-3"/> Falha
                                            </span>
                                        }
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {res.detalhe?.includes('E-mail não preenchido') ? (
                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                <AlertTriangle size={14} /> {res.detalhe}
                                            </span>
                                        ) : (
                                            res.detalhe
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pb-8">
                <Link
                    to="/"
                    className="group inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-300 h-10 px-4 py-2 shadow-sm"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar para Filtros
                </Link>
            </div>
        </div>
    );
};

export default AutomacaoStatus;