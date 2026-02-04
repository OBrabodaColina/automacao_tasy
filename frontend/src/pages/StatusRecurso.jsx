import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    CheckCircle2, XCircle, Loader2, ArrowLeft, 
    User, FileText, Activity 
} from 'lucide-react';

const StatusRecurso = () => {
    const { id } = useParams();
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState(false);

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
                console.error(err);
                if(err.response?.status !== 401) setError(true);
            }
        };

        fetchData();
        intervalId = setInterval(fetchData, 2000);
        return () => { isMounted = false; if (intervalId) clearInterval(intervalId); };
    }, [id]);

    if (error) return <div className="p-10 text-center text-red-500">Erro ao carregar status.</div>;
    if (!statusData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

    const progress = statusData.total > 0 ? (statusData.concluidos / statusData.total) * 100 : 0;
    const isDone = statusData.status === 'CONCLUIDO';

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Status */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {isDone ? <CheckCircle2 className="text-emerald-500"/> : <Loader2 className="animate-spin text-blue-500"/>}
                            {isDone ? 'Autorizações Processadas' : 'Processando Fila...'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Recurso Próprio • Job #{id}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                        {statusData.status}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span>Progresso: {statusData.concluidos} / {statusData.total}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ease-out rounded-full ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Tabela Customizada para Recurso Próprio */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Detalhamento por Paciente</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Atendimento</th>
                                <th className="p-4 font-medium">Paciente</th>
                                <th className="p-4 font-medium">Sequência</th>
                                <th className="p-4 font-medium">Mensagem do Sistema</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {statusData.resultados?.map((res, idx) => {
                                // Lógica de Parse do JSON armazenado no 'detalhe'
                                let meta = { msg: res.detalhe, paciente: '-', atendimento: '-' };
                                try {
                                    const parsed = JSON.parse(res.detalhe);
                                    if (parsed && typeof parsed === 'object') {
                                        meta = parsed;
                                    }
                                } catch (e) {
                                    // Se não for JSON (jobs antigos), mantém o texto original em msg
                                    meta.msg = res.detalhe;
                                }

                                return (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4 w-32">
                                            {res.status === 'SUCESSO' ?
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <CheckCircle2 size={12}/> Sucesso
                                                </span> :
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400">
                                                    <XCircle size={12}/> Falha
                                                </span>
                                            }
                                        </td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Activity size={14} className="text-slate-400"/>
                                                {meta.atendimento}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400"/>
                                                {meta.paciente}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-mono">
                                            {res.nr_titulo}
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={meta.msg}>
                                            {meta.msg}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pb-8">
                <Link to="/recurso-proprio" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 h-10 px-4 py-2 shadow-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Link>
            </div>
        </div>
    );
};

export default StatusRecurso;