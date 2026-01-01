import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Telas
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DeliveryForm from './components/DeliveryForm';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkUserRole(session?.user?.id);
    });

    // Mudança de autenticação
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        checkUserRole(session?.user?.id);
      });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId?: string) => {
    if (!userId) {
      setIsAdmin(false);
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

  // Loading global
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>

      {/* LOGIN (PÚBLICO) */}
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />

      {/* ROTAS PROTEGIDAS */}
      <Route
        path="/"
        element={
          session
            ? <Layout isAdmin={isAdmin} />
            : <Navigate to="/login" replace />
        }
      >
        {/* HOME */}
        <Route
          index
          element={isAdmin ? <Navigate to="/admin" /> : <Dashboard />}
        />

        {/* ROTAS DO MOTORISTA */}
        {!isAdmin && (
          <>
            <Route path="entrega" element={<DeliveryForm />} />
            <Route path="despesa" element={<ExpenseForm />} />
            <Route path="relatorio" element={<Reports />} />
          </>
        )}

        {/* CONFIGURAÇÕES */}
        <Route path="configuracoes" element={<Settings />} />

        {/* ADMIN */}
        {isAdmin && (
          <Route path="admin" element={<AdminPanel />} />
        )}
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;
