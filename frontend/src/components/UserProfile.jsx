import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Dados do LocalStorage
    const username = localStorage.getItem('username') || 'Usuário';
    const role = localStorage.getItem('role') || 'USER';
    const avatar = localStorage.getItem('avatar');
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    // Fecha o dropdown se clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors group outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <div className="text-right hidden md:block">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                        {username}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {role}
                    </div>
                </div>

                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800 group-hover:ring-blue-200 dark:group-hover:ring-slate-700 transition-all overflow-hidden">
                    {avatar ? (
                        <img src={avatar} alt="User" className="h-full w-full object-cover" />
                    ) : (
                        <span>{username.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
                
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                    <div className="p-1">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 md:hidden">
                            <p className="font-medium text-slate-900 dark:text-white truncate">{username}</p>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>

                        {/* --- LINK ATUALIZADO AQUI --- */}
                        <button 
                            onClick={() => handleNavigate('/perfil')} 
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            <User size={16} className="text-slate-400" /> Meu Perfil
                        </button>
                        
                        {/* Apenas Admins veem Configurações */}
                        {role === 'ADMIN' && (
                            <button 
                                onClick={() => handleNavigate('/configuracoes')} 
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <Settings size={16} className="text-slate-400" /> Gestão de Acessos
                            </button>
                        )}
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                        
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;