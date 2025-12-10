import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TabelaTitulos from './components/TabelaTitulos';
import AutomacaoStatus from './pages/AutomacaoStatus';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Configuracoes from './pages/Configuracoes';

const App = () => {
  const location = useLocation();
  // Não mostra Sidebar na tela de login
  const showSidebar = location.pathname !== '/login';

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">

        {/* Renderiza Sidebar apenas se estiver logado */}
        {showSidebar && <Sidebar />}

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 h-screen overflow-auto">
            {/* Header Simples no Topo do Conteúdo */}
            {showSidebar && (
                <header className="bg-white border-b p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
                    <h1 className="font-bold text-slate-700">Painel de Controle</h1>
                    <div className="text-sm text-slate-500">Unimed Rio Verde</div>
                </header>
            )}

            <div className="p-6 w-full max-w-[98%] mx-auto">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <PrivateRoute><TabelaTitulos /></PrivateRoute>
                    } />

                    <Route path="/status/:id" element={
                        <PrivateRoute><AutomacaoStatus /></PrivateRoute>
                    } />

                    {/* Nova Rota */}
                    <Route path="/relatorios" element={
                        <PrivateRoute><Relatorios /></PrivateRoute>
                    } />
                    <Route path="/configuracoes" element={
                        <PrivateRoute><Configuracoes /></PrivateRoute>
                    } />
                </Routes>
            </div>
        </main>
    </div>
  );
};

export default App;