import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Componentes de Layout e Telas
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DeliveryForm from './components/DeliveryForm';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ativa e papel do usuário (Role)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkUserRole(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkUserRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string | undefined) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setIsAdmin(data?.role === 'admin');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* O Layout envolve todas as rotas internas. 
        Passamos isAdmin para o Layout renderizar ou não o menu de admin.
      */}
      <Route path="/" element={<Layout isAdmin={isAdmin} />}>

        {/* Rota Inicial: Dashboard para Motoristas, Admin vai para lista de usuários */}
        <Route index element={isAdmin ? <Navigate to="/admin" /> : <Dashboard />} />

        {/* Rotas Operacionais do Motorista */}
        {!isAdmin && (
          <>
            <Route path="entrega" element={<DeliveryForm />} />
            <Route path="despesa" element={<ExpenseForm />} />
            <Route path="relatorio" element={<Reports />} />
          </>
        )}

        {/* Rota de Configurações (Comum para ambos, mas com visões diferentes no componente) */}
        <Route path="configuracoes" element={<Settings />} />

        {/* Rota Exclusiva do Administrador */}
        {isAdmin && (
          <Route path="admin" element={<AdminPanel />} />
        )}

        {/* Fallback para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;