import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

            toast.success(`Bem-vindo, ${username}!`);
            navigate('/');
        } catch (err) {
            toast.error("Credenciais inválidas. Verifique usuário e senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">

            {/* --- LADO ESQUERDO: Formulário (Ocupa 1/3 a 1/2 da tela) --- */}
            <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="w-full max-w-sm mx-auto">
                    {/* Header do Form */}
                    <div className="mb-10">
                        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Bem-vindo de volta</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Acesse o Portal de Automação da Unimed Rio Verde.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Usuário Corporativo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                    placeholder="ex: nome.sobrenome"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Senha</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Acessar Painel <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            © 2025 Tecnologia da Informação
                        </p>
                    </div>
                </div>
            </div>

            {/* --- LADO DIREITO: Decoração Visual (Ocupa o resto) --- */}
            <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center">
                {/* Background Animado */}
                <div className="absolute inset-0">
                    <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                    <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
                    <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
                </div>

                {/* Conteúdo sobre a decoração */}
                <div className="relative z-10 text-center px-10 max-w-2xl">
                    <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        Eficiência e Controle na<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            Gestão de Títulos
                        </span>
                    </h2>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Automatize o envio de boletos, acompanhe status em tempo real e reduza o trabalho manual da equipe financeira.
                    </p>

                    {/* Card Flutuante Decorativo */}
                    <div className="mt-12 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="text-green-400 w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-white">Processamento Concluído</div>
                                <div className="text-xs text-slate-300">Última execução: Hoje, 10:45</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>Status do Worker</span>
                            <span className="flex items-center gap-1.5 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Import necessário para o ícone decorativo (CheckCircle2)
import { CheckCircle2 } from 'lucide-react';

export default Login;