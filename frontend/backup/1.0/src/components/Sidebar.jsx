import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    // Converte string "true"/"false" do localStorage para boolean real
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const handleLogout = () => {
        // Limpa tudo ao sair
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    // Função auxiliar para estilizar os links ativos/inativos
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 transition-colors ${
            isActive ? 'bg-blue-600 text-white border-r-4 border-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`;

    return (
        <div className="w-64 bg-slate-900 min-h-screen flex flex-col text-white shadow-xl z-10">
            {/* Header da Sidebar */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">AT</div>
                <span className="font-bold text-lg">Automação Tasy</span>
            </div>

            {/* Menu de Navegação */}
            <nav className="flex-1 mt-6">
                <NavLink to="/" className={linkClass}>
                    <LayoutDashboard size={20} />
                    <span>Execução</span>
                </NavLink>

                <NavLink to="/relatorios" className={linkClass}>
                    <FileText size={20} />
                    <span>Relatórios</span>
                </NavLink>

                {/* Lógica Condicional: Configurações */}
                {isAdmin ? (
                    <NavLink to="/configuracoes" className={linkClass}>
                        <Settings size={20} />
                        <span>Configurações</span>
                    </NavLink>
                ) : (
                    <div className="px-4 py-3 text-slate-600 flex items-center gap-3 opacity-50 cursor-not-allowed select-none" title="Acesso restrito a administradores">
                        <Settings size={20} />
                        <span>Configurações</span>
                    </div>
                )}
            </nav>

            {/* Botão de Logout */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 hover:bg-slate-800 rounded transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;