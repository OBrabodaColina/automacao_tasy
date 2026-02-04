import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FileText, 
    Settings, 
    ShieldCheck, 
    Sun, 
    Moon,
    Stethoscope
} from 'lucide-react';
import useTheme from '../hooks/useTheme';

const Sidebar = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    const linkClass = ({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 mx-3 rounded-md text-sm font-medium transition-all duration-200 ${
            isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`;

    return (
        <aside className="w-64 bg-slate-900 min-h-screen flex flex-col border-r border-slate-800 z-30 transition-colors duration-300">
            
            {/* Header da Sidebar (Apenas Logo agora) */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 font-bold text-slate-100 tracking-tight">Portal Hub</span>
            </div>

            {/* Navegação */}
            <nav className="flex-1 mt-6 space-y-1 overflow-y-auto custom-scrollbar">

                <div className="px-6 mb-2 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Visão Geral
                </div>
                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard size={18} /> {/* Importar ícone se precisar */}
                    <span>Dashboard</span>
                </NavLink>
                
                <div className="px-6 mb-2 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Financeiro
                </div>
                <NavLink to="/" className={linkClass}>
                    <LayoutDashboard size={18} />
                    <span>Boletos</span>
                </NavLink>

                <div className="px-6 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Hospital
                </div>
                <NavLink to="/recurso-proprio" className={linkClass}>
                    <Stethoscope size={18} />
                    <span>Autorizações</span>
                </NavLink>

                <div className="px-6 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Relatórios
                </div>

                <NavLink to="/relatorios" className={linkClass}>
                    <FileText size={18} />
                    <span>Relatórios</span>
                </NavLink>

                {isAdmin && (
                    <>
                        <div className="px-6 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Admin
                        </div>
                        <NavLink to="/configuracoes" className={linkClass}>
                            <Settings size={18} />
                            <span>Configurações</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* Rodapé (Botão de Tema) */}
            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-full gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition-all text-xs font-medium border border-slate-800"
                >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;