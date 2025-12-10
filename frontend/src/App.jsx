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

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';

  return (
    // ADICIONADO: dark:bg-slate-950 dark:text-slate-100 para o fundo geral
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">

        <Toaster position="top-right" richColors closeButton theme="system" />

        {showSidebar && <Sidebar />}

        <main className="flex-1 h-screen overflow-auto relative scroll-smooth">
            {showSidebar && (
                // ADICIONADO: dark:bg-slate-900/80 dark:border-slate-800 para o header
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center transition-colors duration-300">
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">Painel de Controle</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unimed Rio Verde • Automação Financeira</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800">
                        U
                    </div>
                </header>
            )}

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><TabelaTitulos /></PrivateRoute>} />
                    <Route path="/status/:id" element={<PrivateRoute><AutomacaoStatus /></PrivateRoute>} />
                    <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
                    <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
                </Routes>
            </div>
        </main>
    </div>
  );
};

export default App;