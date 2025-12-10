import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    ShieldCheck,
    Sun,
    Moon
} from 'lucide-react';
import useTheme from '../hooks/useTheme'; // <--- Importe o Hook aqui

const Sidebar = () => {
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const { theme, toggleTheme } = useTheme(); // <--- Uso do Hook

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 mx-3 rounded-md text-sm font-medium transition-all duration-200 ${
            isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`;

    return (
        <aside className="w-64 bg-slate-900 min-h-screen flex flex-col border-r border-slate-800 z-30 transition-colors duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 font-bold text-slate-100 tracking-tight">Tasy Auto</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 space-y-1">
                <div className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Menu Principal
                </div>

                <NavLink to="/" className={linkClass}>
                    <LayoutDashboard size={18} />
                    <span>Execução</span>
                </NavLink>

                <NavLink to="/relatorios" className={linkClass}>
                    <FileText size={18} />
                    <span>Relatórios</span>
                </NavLink>

                <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sistema
                </div>

                {isAdmin ? (
                    <NavLink to="/configuracoes" className={linkClass}>
                        <Settings size={18} />
                        <span>Configurações</span>
                    </NavLink>
                ) : (
                    <div className="mx-3 px-3 py-2.5 flex items-center gap-3 text-slate-600 cursor-not-allowed opacity-60">
                        <Settings size={18} />
                        <span>Configurações</span>
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50 space-y-2">

                {/* Botão de Tema (Dark/Light) */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 text-slate-400 hover:text-yellow-400 w-full px-3 py-2 rounded-md hover:bg-slate-800 transition-all text-sm font-medium"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={18} /> <span>Modo Claro</span>
                        </>
                    ) : (
                        <>
                            <Moon size={18} /> <span>Modo Escuro</span>
                        </>
                    )}
                </button>

                {/* Botão Sair */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-slate-400 hover:text-red-400 w-full px-3 py-2 rounded-md hover:bg-slate-800 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;