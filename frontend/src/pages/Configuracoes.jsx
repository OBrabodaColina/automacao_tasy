import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import {
    UserPlus, Trash2, User, Lock,
    ShieldCheck, Loader2
} from 'lucide-react';

const Configuracoes = () => {
    const [users, setUsers] = useState([]);
    const [novoUser, setNovoUser] = useState({ username: '', password: '', is_admin: false });
    const [loading, setLoading] = useState(false);

    const carregarUsuarios = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            toast.error("Erro ao carregar lista de usuários.");
        }
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const criarUsuario = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users', novoUser);
            toast.success(`Usuário ${novoUser.username} criado com sucesso!`);
            setNovoUser({ username: '', password: '', is_admin: false });
            carregarUsuarios();
        } catch (error) {
            const msg = error.response?.data?.msg || 'Erro desconhecido ao criar usuário.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const deletarUsuario = async (id, username) => {
        if (!confirm(`Tem certeza que deseja remover o acesso de ${username}?`)) return;

        try {
            await api.delete(`/users?id=${id}`);
            toast.success("Usuário removido.");
            carregarUsuarios();
        } catch (error) {
            toast.error("Erro ao remover usuário.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Gestão de Acessos</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Controle quem tem permissão para acessar o painel e configurações.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form de Criação */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24 transition-colors duration-300">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><UserPlus size={18}/></div>
                            Adicionar Usuário
                        </h3>

                        <form onSubmit={criarUsuario} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Nome de Usuário</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 pl-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="Ex: joao.silva"
                                        value={novoUser.username}
                                        onChange={e => setNovoUser({...novoUser, username: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Senha de Acesso</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="password"
                                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 pl-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="••••••••"
                                        value={novoUser.password}
                                        onChange={e => setNovoUser({...novoUser, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <label className="flex items-center space-x-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={novoUser.is_admin}
                                    onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:border-slate-500"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Permissão de Administrador</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : 'Criar Credencial'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Usuários */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Usuários Ativos</h3>
                            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full font-bold">{users.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map(u => (
                                <div key={u.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                                            u.is_admin ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700'
                                        }`}>
                                            {u.username.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">{u.username}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {u.is_admin ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                                                        <ShieldCheck size={10} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Usuário Padrão</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deletarUsuario(u.id, u.username)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remover acesso"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                                    Nenhum usuário cadastrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;