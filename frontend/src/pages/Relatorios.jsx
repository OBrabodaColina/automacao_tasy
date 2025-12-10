import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import {
    CheckCircle2, Clock, FileDown, AlertTriangle, MailWarning, Eye,
    RefreshCw, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Relatorios = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 5; // Cards de relatório ocupam mais espaço

    const carregarJobs = async () => {
        try {
            const res = await api.get('/jobs');

        const jobsOrdenados = res.data.sort((a, b) => {
            return Number(b.job_id) - Number(a.job_id);
            });

            setJobs(jobsOrdenados);
            setPaginaAtual(1); // Reseta paginação ao recarregar
        } catch (error) {
            toast.error("Erro ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarJobs(); }, []);

    // Lógica de Fatiamento
    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const jobsAtuais = jobs.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(jobs.length / itensPorPagina);

    const baixarCsv = async (jobId) => {
        const promise = api.get(`/jobs/${jobId}/download`, { responseType: 'blob' });
        toast.promise(promise, {
            loading: 'Gerando CSV...',
            success: (response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `log_${jobId}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                return 'Download iniciado!';
            },
            error: 'Erro ao baixar.'
        });
    };

    const calcularStats = (job) => {
        if (job.stats_email !== undefined) {
            return {
                sucessos: job.concluidos,
                semEmail: job.stats_email,
                errosTecnicos: job.stats_tecnico
            };
        }
        if (job.resultados && job.resultados.length > 0) {
            const semEmail = job.resultados.filter(r => r.status === 'FALHA' && r.detalhe.includes('E-mail não preenchido')).length;
            const errosTecnicos = job.resultados.filter(r => r.status === 'FALHA' && !r.detalhe.includes('E-mail não preenchido')).length;
            return { sucessos: job.concluidos, semEmail, errosTecnicos };
        }
        const totalFalhas = (job.total || 0) - (job.concluidos || 0);
        return {
            sucessos: job.concluidos,
            semEmail: '?',
            errosTecnicos: totalFalhas > 0 ? totalFalhas : 0,
            isGeneric: true
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Relatório de Execuções</h2>
                <button onClick={() => { setLoading(true); carregarJobs(); }} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid gap-4">
                {/* Renderiza apenas os jobs da página atual */}
                {jobsAtuais.map((job) => {
                    const stats = calcularStats(job);

                    return (
                        <div key={job.job_id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col xl:flex-row gap-6 hover:shadow-md transition-all duration-300">
                            {/* Info Principal */}
                            <div className="flex items-start gap-4 min-w-[200px]">
                                <div className={`p-3 rounded-lg ${
                                    job.status === 'CONCLUIDO'
                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                    {job.status === 'CONCLUIDO' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white text-lg">Job #{job.job_id}</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <Calendar size={14}/> {job.start_time ? new Date(job.start_time).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                <StatBox label="Total" value={job.total} color="slate" />
                                <StatBox label="Sucesso" value={stats.sucessos} color="green" />

                                {stats.semEmail === '?' ? (
                                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 border-dashed">
                                        <div className="text-xl font-bold text-gray-400 dark:text-slate-500">-</div>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Ver Detalhes</div>
                                    </div>
                                ) : (
                                    <StatBox
                                        label="Sem E-mail"
                                        value={stats.semEmail}
                                        color="amber"
                                        icon={stats.semEmail > 0 ? MailWarning : null}
                                    />
                                )}

                                <StatBox
                                    label={stats.isGeneric ? "Falhas (Geral)" : "Falhas Téc."}
                                    value={stats.errosTecnicos}
                                    color="rose"
                                    icon={stats.errosTecnicos > 0 ? AlertTriangle : null}
                                />
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 justify-end xl:w-auto w-full pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-700">
                                <Link to={`/status/${job.job_id}`} className="flex items-center justify-center px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" title="Ver Detalhes">
                                    <Eye size={18} />
                                </Link>
                                <button onClick={() => baixarCsv(job.job_id)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-all">
                                    <FileDown size={18} />
                                    <span>CSV</span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Estado vazio */}
                {!loading && jobs.length === 0 && (
                     <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">Nenhum relatório encontrado.</p>
                     </div>
                )}
            </div>

            {/* Rodapé com Paginação */}
            {!loading && jobs.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 md:mb-0">
                        Mostrando <strong className="text-slate-700 dark:text-slate-200">{indexPrimeiro + 1}</strong> a <strong className="text-slate-700 dark:text-slate-200">{Math.min(indexUltimo, jobs.length)}</strong> de <strong className="text-slate-700 dark:text-slate-200">{jobs.length}</strong> relatórios
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                            disabled={paginaAtual === 1}
                            className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                        </button>
                        <span className="px-4 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center bg-white dark:bg-slate-700 border dark:border-slate-600 rounded shadow-sm">
                            {paginaAtual} / {totalPaginas}
                        </span>
                        <button
                            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaAtual === totalPaginas}
                            className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300"
                        >
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar com suporte a Dark Mode
const StatBox = ({ label, value, color, icon: Icon }) => {
    const colors = {
        slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600",
        green: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
    };
    return (
        <div className={`text-center p-2 rounded-lg border transition-colors ${colors[color]}`}>
            <div className="text-xl font-bold flex items-center justify-center gap-1">
                {value} {Icon && <Icon size={14} />}
            </div>
            <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider">{label}</div>
        </div>
    );
};

export default Relatorios;