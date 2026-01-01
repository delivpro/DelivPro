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
    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) checkUserRole(currentSession.user?.id);
      else setLoading(false);
    });

    // Escuta mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) checkUserRole(currentSession.user?.id);
      else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId?: string) => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error("Erro ao checar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#76e85b] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          session
            ? <Layout isAdmin={isAdmin} />
            : <Navigate to="/login" replace />
        }
      >
        <Route
          index
          element={isAdmin ? <Navigate to="/admin" /> : <Dashboard />}
        />

        {!isAdmin && (
          <>
            <Route path="entrega" element={<DeliveryForm />} />
            <Route path="despesa" element={<ExpenseForm />} />
            <Route path="relatorio" element={<Reports />} />
          </>
        )}

        <Route path="configuracoes" element={<Settings />} />

        {isAdmin && (
          <Route path="admin" element={<AdminPanel />} />
        )}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;