
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Lock } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import DeliveryForm from './components/DeliveryForm';
import ExpenseForm from './components/ExpenseForm';
import Login from './components/Login';
import { AppState, View, Delivery, Expense, Vehicle, User } from './types';
import { STORAGE_KEY, DEFAULT_STATE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed };
  });

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Filtragem de dados por usuário logado
  const userDeliveries = useMemo(() => 
    state.deliveries.filter(d => d.userId === state.currentUser?.id), 
    [state.deliveries, state.currentUser]
  );

  const userExpenses = useMemo(() => 
    state.expenses.filter(e => e.userId === state.currentUser?.id), 
    [state.expenses, state.currentUser]
  );

  const handleLogin = (email: string, pass: string) => {
    const user = state.users.find(u => u.email === email && u.password === pass);
    
    if (user) {
      // Verificar expiração
      if (user.expirationDate !== 'lifetime' && new Date(user.expirationDate) < new Date()) {
        setLoginError('Seu acesso expirou. Entre em contato com o suporte.');
        return;
      }

      setState(prev => ({ ...prev, currentUser: user }));
      setLoginError('');
      
      if (user.mustChangePassword) {
        setShowPasswordChange(true);
      }
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setActiveView('dashboard');
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, password: newPassword, mustChangePassword: false } : u),
      currentUser: prev.currentUser ? { ...prev.currentUser, mustChangePassword: false } : null
    }));
    setShowPasswordChange(false);
    alert('Senha atualizada com sucesso!');
  };

  const syncWithApi = useCallback(async (action: string, data?: any) => {
    if (!state.isSyncEnabled || !state.apiUrl) return;
    try {
      setIsLoading(true);
      const url = new URL(state.apiUrl);
      url.searchParams.append('action', action);
      const response = await fetch(url.toString(), {
        method: data ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });
      return await response.json();
    } catch (error) {
      console.error('Erro de sincronização:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.isSyncEnabled, state.apiUrl]);

  const handleAddDelivery = useCallback(async (deliveryData: Partial<Delivery>) => {
    if (!state.currentUser) return;

    const newDelivery: Delivery = deliveryData.id 
      ? { ...state.deliveries.find(d => d.id === deliveryData.id)!, ...deliveryData } as Delivery
      : {
          id: crypto.randomUUID(),
          userId: state.currentUser.id,
          date: deliveryData.date!,
          platform: deliveryData.platform!,
          startTime: deliveryData.startTime!,
          startKm: deliveryData.startKm!,
          status: 'ongoing',
        };

    setState(prev => {
      if (deliveryData.id) {
        return {
          ...prev,
          deliveries: prev.deliveries.map(d => d.id === deliveryData.id ? newDelivery : d)
        };
      }
      return { ...prev, deliveries: [newDelivery, ...prev.deliveries] };
    });

    await syncWithApi(deliveryData.id ? 'update_delivery' : 'create_delivery', newDelivery);
  }, [state.deliveries, state.currentUser, syncWithApi]);

  const handleAddExpense = useCallback(async (expenseData: Partial<Expense>) => {
    if (!state.currentUser) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      userId: state.currentUser.id,
      date: expenseData.date!,
      category: expenseData.category!,
      value: expenseData.value!,
      km: expenseData.km!,
      liters: expenseData.liters,
      fullTank: expenseData.fullTank || false
    };
    setState(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
    await syncWithApi('create_expense', newExpense);
  }, [state.currentUser, syncWithApi]);

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
    } as User;
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const handleUpdateUser = (userData: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userData.id ? userData : u)
    }));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este usuário?')) {
      setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    }
  };

  // Se não estiver logado
  if (!state.currentUser) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // Se precisar trocar senha
  if (showPasswordChange) {
    return (
      <div className="fixed inset-0 bg-dark z-[200] flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-md border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6 text-primary">
            <Lock size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Primeiro Acesso</h2>
          <p className="text-gray-400 text-center mb-8">Para sua segurança, defina uma nova senha definitiva.</p>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Nova senha (mín. 6 chars)"
              className="w-full bg-dark border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <button 
              onClick={handleUpdatePassword}
              className="w-full bg-primary text-dark font-bold py-3 rounded-xl hover:opacity-90"
            >
              Confirmar Nova Senha
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeDelivery = userDeliveries.find(d => d.status === 'ongoing');

  return (
    <div className="flex min-h-screen relative">
      {isLoading && (
        <div className="fixed bottom-4 right-4 z-[60] bg-primary text-dark px-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <RefreshCw size={16} className="animate-spin" /> Sincronizando...
        </div>
      )}

      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 bg-dark overflow-y-auto">
        {activeView === 'dashboard' && (
          <Dashboard 
            state={{ ...state, deliveries: userDeliveries, expenses: userExpenses }} 
            onOpenDelivery={() => setIsDeliveryModalOpen(true)}
            onOpenExpense={() => setIsExpenseModalOpen(true)}
          />
        )}
        {activeView === 'reports' && <Reports state={{ ...state, deliveries: userDeliveries, expenses: userExpenses }} />}
        {activeView === 'settings' && (
          <Settings 
            state={state}
            onUpdateVehicle={v => setState(prev => ({ ...prev, vehicle: v }))}
            onAddCategory={c => setState(prev => ({ ...prev, categories: [...prev.categories, c] }))}
            onRemoveCategory={c => setState(prev => ({ ...prev, categories: prev.categories.filter(cat => cat !== c) }))}
            onAddPlatform={p => setState(prev => ({ ...prev, platforms: [...prev.platforms, p] }))}
            onRemovePlatform={p => setState(prev => ({ ...prev, platforms: prev.platforms.filter(plat => plat !== p) }))}
            onUpdateApiSettings={(url, enabled) => setState(prev => ({ ...prev, apiUrl: url, isSyncEnabled: enabled }))}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {isDeliveryModalOpen && (
        <DeliveryForm 
          onClose={() => setIsDeliveryModalOpen(false)} 
          onSubmit={handleAddDelivery}
          activeDelivery={activeDelivery}
          platforms={state.platforms}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseForm 
          onClose={() => setIsExpenseModalOpen(false)} 
          onSubmit={handleAddExpense}
          categories={state.categories}
        />
      )}
    </div>
  );
};

export default App;
