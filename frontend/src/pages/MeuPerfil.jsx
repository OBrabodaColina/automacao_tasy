import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { User, Lock, Camera, Save, Loader2, Link as LinkIcon } from 'lucide-react';

const MeuPerfil = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        avatar_url: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setFormData(prev => ({
                    ...prev,
                    username: res.data.username,
                    full_name: res.data.full_name || '',
                    avatar_url: res.data.avatar_url || ''
                }));
            } catch (error) {
                toast.error("Erro ao carregar perfil.");
            } finally {
                setInitialLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("As senhas não conferem.");
        }

        setLoading(true);
        try {
            const payload = {
                full_name: formData.full_name,
                avatar_url: formData.avatar_url
            };
            if (formData.password) payload.password = formData.password;

            await api.put('/users/me', payload);
            toast.success("Perfil atualizado com sucesso!");
            
            // Atualiza localStorage para refletir mudança imediata no header (opcional)
            if (formData.avatar_url) localStorage.setItem('avatar', formData.avatar_url);
            
            setFormData(prev => ({...prev, password: '', confirmPassword: ''}));
        } catch (error) {
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h2>
                <p className="text-slate-500 text-sm">Gerencie suas informações pessoais e credenciais.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-600 shadow-lg">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-slate-400">{formData.username?.substring(0,2).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{formData.username}</h3>
                            <p className="text-xs text-slate-500">Usuário Corporativo</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL do Avatar</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.avatar_url}
                                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Deixe vazio para manter"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Confirme a nova senha"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MeuPerfil;