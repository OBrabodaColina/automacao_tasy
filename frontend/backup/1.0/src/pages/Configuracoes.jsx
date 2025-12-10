import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Trash2, Shield, ShieldAlert } from 'lucide-react';

const Configuracoes = () => {
    const [users, setUsers] = useState([]);
    const [novoUser, setNovoUser] = useState({ username: '', password: '', is_admin: false });
    const [msg, setMsg] = useState('');

    const carregarUsuarios = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Erro ao carregar usuários", error);
        }
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const criarUsuario = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', novoUser);
            setMsg('Usuário criado!');
            setNovoUser({ username: '', password: '', is_admin: false });
            carregarUsuarios();
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg(error.response?.data?.msg || 'Erro ao criar');
        }
    };

    const deletarUsuario = async (id) => {
        if (!confirm("Tem certeza?")) return;
        try {
            await api.delete(`/users?id=${id}`);
            carregarUsuarios();
        } catch (error) {
            alert(error.response?.data?.msg || "Erro ao deletar");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="text-blue-600"/> Gestão de Acessos
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form de Criação */}
                <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                        <UserPlus size={20}/> Novo Usuário
                    </h3>
                    <form onSubmit={criarUsuario} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Usuário</label>
                            <input
                                className="w-full border p-2 rounded mt-1"
                                value={novoUser.username}
                                onChange={e => setNovoUser({...novoUser, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Senha</label>
                            <input
                                type="password"
                                className="w-full border p-2 rounded mt-1"
                                value={novoUser.password}
                                onChange={e => setNovoUser({...novoUser, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="adminCheck"
                                checked={novoUser.is_admin}
                                onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})}
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="adminCheck" className="text-sm text-slate-700 select-none">Conceder acesso de Administrador</label>
                        </div>

                        {msg && <p className="text-sm text-blue-600 font-medium">{msg}</p>}

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
                            Criar Usuário
                        </button>
                    </form>
                </div>

                {/* Lista de Usuários */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 text-slate-700">Usuários Ativos</h3>
                    <div className="divide-y">
                        {users.map(u => (
                            <div key={u.id} className="py-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${u.is_admin ? 'bg-purple-600' : 'bg-slate-400'}`}>
                                        {u.username.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{u.username}</div>
                                        <div className="text-xs text-slate-500">{u.is_admin ? 'Administrador' : 'Usuário Padrão'}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deletarUsuario(u.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition"
                                    title="Remover acesso"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;