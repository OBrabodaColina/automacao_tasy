import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import {
    UserPlus, Trash2, User, Lock,
    ShieldCheck, Loader2, Pencil, X, Save, Eye, Briefcase
} from 'lucide-react';

const Configuracoes = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ id: null, username: '', password: '', role: 'USER' });
    const [isEditing, setIsEditing] = useState(false);
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

    const resetForm = () => {
        setFormData({ id: null, username: '', password: '', role: 'USER' });
        setIsEditing(false);
    };

    const handleEdit = (user) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '',
            role: user.role || 'USER'
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                const payload = { id: formData.id, role: formData.role };
                if (formData.password) payload.password = formData.password;

                await api.put('/users', payload);
                toast.success(`Usuário atualizado!`);
            } else {
                if (!formData.password) {
                    toast.error("Senha obrigatória.");
                    setLoading(false);
                    return;
                }
                await api.post('/users', formData);
                toast.success(`Usuário criado!`);
            }
            resetForm();
            carregarUsuarios();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Erro na operação.');
        } finally {
            setLoading(false);
        }
    };

    const deletarUsuario = async (id, username) => {
        if (!confirm(`Remover acesso de ${username}?`)) return;
        try {
            await api.delete(`/users?id=${id}`);
            toast.success("Usuário removido.");
            if (isEditing && formData.id === id) resetForm();
            carregarUsuarios();
        } catch (error) {
            toast.error("Erro ao remover.");
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'ADMIN': return { label: 'Admin', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ShieldCheck };
            case 'OPERADOR': return { label: 'Operador', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Briefcase };
            default: return { label: 'Leitor', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Eye };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Acessos</h2>
                <p className="text-slate-500 text-sm">Controle hierárquico de usuários.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-xl border sticky top-24 transition-colors ${isEditing ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                {isEditing ? <Pencil size={18}/> : <UserPlus size={18}/>}
                                {isEditing ? 'Editar Função' : 'Novo Usuário'}
                            </h3>
                            {isEditing && <button onClick={resetForm}><X size={16} className="text-slate-400 hover:text-red-500"/></button>}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuário</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 pl-9 text-sm"
                                        placeholder="usuario.corporativo"
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        disabled={isEditing}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input type="password" className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 pl-9 text-sm"
                                        placeholder={isEditing ? "Manter atual" : "••••••••"}
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        required={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nível de Acesso</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="USER">Leitor (Apenas Visualiza)</option>
                                    <option value="OPERADOR">Operador (Executa Robôs)</option>
                                    <option value="ADMIN">Administrador (Total)</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-all flex justify-center items-center">
                                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : (isEditing ? 'Salvar' : 'Criar')}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map(u => {
                                const badge = getRoleBadge(u.role);
                                const BadgeIcon = badge.icon;
                                return (
                                    <div key={u.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                {u.username.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{u.username}</div>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                                                    <BadgeIcon size={10} /> {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(u)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded"><Pencil size={16}/></button>
                                            <button onClick={() => deletarUsuario(u.id, u.username)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;