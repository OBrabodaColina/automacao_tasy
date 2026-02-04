import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

const Relatorios = () => {
    const [jobs, setJobs] = useState([]);

    const carregarJobs = async () => {
        try {
            const res = await api.get('/jobs');
            // Ordena do mais recente pro mais antigo
            setJobs(res.data.reverse());
        } catch (error) {
            console.error("Erro ao carregar jobs", error);
        }
    };

    useEffect(() => { carregarJobs(); }, []);

    const baixarCsv = async (jobId) => {
        try {
            const response = await api.get(`/jobs/${jobId}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `log_${jobId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Erro ao baixar log");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileSpreadsheet className="text-blue-600"/> Relatório de Execuções
            </h2>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <div key={job.job_id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Header do Card (Estilo do E-mail) */}
                        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Job ID</span>
                                <div className="font-mono">{job.job_id}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                job.status === 'CONCLUIDO' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                                {job.status}
                            </div>
                        </div>

                        {/* Corpo com Estatísticas */}
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                <div className="bg-slate-50 p-3 rounded border">
                                    <div className="text-xs text-slate-500">Total</div>
                                    <div className="text-xl font-bold text-slate-700">{job.total}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded border border-green-100">
                                    <div className="text-xs text-green-600">Processados</div>
                                    <div className="text-xl font-bold text-green-700">{job.concluidos}</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition" onClick={() => baixarCsv(job.job_id)}>
                                    <div className="flex flex-col items-center gap-1 text-blue-700">
                                        <Download size={16} />
                                        <span className="text-xs font-bold">Baixar Log (CSV)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {jobs.length === 0 && (
                    <div className="text-center p-10 text-gray-400 bg-gray-50 rounded border border-dashed">
                        Nenhuma execução registrada desde a última reinicialização do servidor.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Relatorios;