import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import TabelaTitulos from './components/TabelaTitulos';
import AutomacaoStatus from './pages/AutomacaoStatus';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Configuracoes from './pages/Configuracoes';
import UserProfile from './components/UserProfile';
import MeuPerfil from './pages/MeuPerfil';
import RecursoProprio from './pages/RecursoProprio';
import StatusRecurso from './pages/StatusRecurso';
import Dashboard from './pages/Dashboard';

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">

        <Toaster position="top-right" richColors closeButton theme="system" />

        {showSidebar && <Sidebar />}

        <main className="flex-1 h-screen overflow-auto relative scroll-smooth">
            {showSidebar && (
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 sticky top-0 z-20 flex justify-between items-center transition-colors duration-300">
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">Painel de Controle</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unimed Rio Verde • Automação Financeira</p>
                    </div>
                    
                    <div>
                        <UserProfile />
                    </div>
                    
                </header>
            )}

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><TabelaTitulos /></PrivateRoute>} />
                    <Route path="/status/:id" element={<PrivateRoute><AutomacaoStatus /></PrivateRoute>} />
                    <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
                    <Route path="/recurso-proprio" element={<PrivateRoute><RecursoProprio /></PrivateRoute>} />
                    <Route path="/status-recurso/:id" element={<PrivateRoute><StatusRecurso /></PrivateRoute>} />
                    <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
                    <Route path="/perfil" element={<PrivateRoute><MeuPerfil /></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                </Routes>
            </div>
        </main>
    </div>
  );
};

export default App;