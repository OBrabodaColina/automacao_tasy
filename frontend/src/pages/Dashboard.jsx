import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    LayoutDashboard, TrendingUp, Activity, 
    CheckCircle2, AlertOctagon, BarChart3 
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
    if (!stats) return null;

    // Dados seguros (caso venha null do backend)
    const boletos = stats.detalhes?.BOLETOS || { execucoes: 0, processados: 0, taxa_sucesso: 0 };
    const recurso = stats.detalhes?.RECURSO_PROPRIO || { execucoes: 0, processados: 0, taxa_sucesso: 0 };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Gerencial</h2>
                <p className="text-slate-500 text-sm">Visão geral da performance das automações.</p>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard 
                    title="Total de Execuções" 
                    value={stats.geral_jobs} 
                    icon={Activity} 
                    color="blue"
                    sub="Histórico completo"
                />
                <KpiCard 
                    title="Processados (Boletos)" 
                    value={boletos.processados} 
                    icon={LayoutDashboard} 
                    color="indigo" 
                    sub={`${boletos.taxa_sucesso}% de Sucesso`}
                />
                <KpiCard 
                    title="Processados (Recurso)" 
                    value={recurso.processados} 
                    icon={TrendingUp} 
                    color="emerald" 
                    sub={`${recurso.taxa_sucesso}% de Sucesso`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Barras (CSS Puro) - Execuções 7 dias */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BarChart3 size={18} className="text-slate-400"/>
                            Volume Semanal
                        </h3>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Boletos</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recurso</div>
                        </div>
                    </div>
                    
                    <div className="h-48 flex items-end justify-between gap-2">
                        {stats.grafico_7_dias.map((dia, idx) => {
                            // Escala simples: assume max de 20 jobs/dia para altura 100% (ajuste conforme realidade)
                            const maxScale = 20; 
                            const hBoletos = Math.min((dia.boletos / maxScale) * 100, 100);
                            const hRecurso = Math.min((dia.recurso / maxScale) * 100, 100);

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                                    <div className="relative w-full flex gap-1 justify-center items-end h-full">
                                        {/* Barra Boletos */}
                                        <div 
                                            style={{ height: `${hBoletos}%` }} 
                                            className="w-3 bg-blue-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all"
                                            title={`Boletos: ${dia.boletos}`}
                                        ></div>
                                        {/* Barra Recurso */}
                                        <div 
                                            style={{ height: `${hRecurso}%` }} 
                                            className="w-3 bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all"
                                            title={`Recurso: ${dia.recurso}`}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{dia.dia}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Card de Saúde das Automações */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Saúde do Sistema</h3>
                        <div className="space-y-6">
                            <HealthBar 
                                label="Envio de Boletos" 
                                percent={boletos.taxa_sucesso} 
                                color="bg-blue-500" 
                                total={boletos.execucoes}
                            />
                            <HealthBar 
                                label="Recurso Próprio" 
                                percent={recurso.taxa_sucesso} 
                                color="bg-emerald-500" 
                                total={recurso.execucoes}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <CheckCircle2 className="text-green-500 h-8 w-8" />
                            <div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Sistema Operante</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Todos os serviços respondendo normalmente.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---

const KpiCard = ({ title, value, icon: Icon, color, sub }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
            {sub && <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{sub}</div>}
        </div>
    );
};

const HealthBar = ({ label, percent, color, total }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <span className="font-bold text-slate-900 dark:text-white">{percent}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div style={{ width: `${percent}%` }} className={`h-full rounded-full transition-all duration-1000 ${color}`}></div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 text-right">{total} execuções registradas</div>
    </div>
);

export default Dashboard;