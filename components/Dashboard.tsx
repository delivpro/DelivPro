
import React, { useMemo } from 'react';
import { Plus, Wallet, Navigation, Package, Receipt, Fuel, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppState, Delivery, Expense } from '../types';
import StatsCard from './StatsCard';
import { formatCurrency, formatKm, calculateAutonomy, getStatusColor } from '../utils/helpers';

interface DashboardProps {
  state: AppState;
  onOpenDelivery: () => void;
  onOpenExpense: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onOpenDelivery, onOpenExpense }) => {
  const { deliveries, expenses, currentUser } = state;

  const stats = useMemo(() => {
    const totalEarnings = deliveries.reduce((acc, d) => acc + (d.value || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.value, 0);
    const balance = totalEarnings - totalExpenses;
    
    const totalKm = deliveries.reduce((acc, d) => {
      if (d.endKm && d.startKm) return acc + (d.endKm - d.startKm);
      return acc;
    }, 0);

    const autonomy = calculateAutonomy(expenses);

    return {
      balance,
      totalKm,
      qtyDeliveries: deliveries.filter(d => d.status === 'completed').length,
      totalExpenses,
      autonomy: autonomy ? `${autonomy.toFixed(2)} km/l` : 'N/A'
    };
  }, [deliveries, expenses]);

  const recentRecords = useMemo(() => {
    const combined = [
      ...deliveries.map(d => ({ ...d, type: 'delivery' })),
      ...expenses.map(e => ({ ...e, type: 'expense' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined.slice(0, 5);
  }, [deliveries, expenses]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(day => {
      const dayEarnings = deliveries
        .filter(d => d.date === day)
        .reduce((acc, d) => acc + (d.value || 0), 0);
      const dayExpenses = expenses
        .filter(e => e.date === day)
        .reduce((acc, e) => acc + e.value, 0);
      
      return {
        name: day.split('-').slice(1).reverse().join('/'),
        earnings: dayEarnings,
        expenses: dayExpenses
      };
    });
  }, [deliveries, expenses]);

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel Geral</h1>
          <p className="text-gray-400">Bem-vindo de volta, <span className="text-primary font-semibold">{currentUser?.name || 'DelivPro'}</span>. Aqui está seu resumo.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onOpenDelivery}
            className="flex items-center gap-2 bg-primary text-dark font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition-transform"
          >
            <Play size={20} /> Entrega
          </button>
          <button 
            onClick={onOpenExpense}
            className="flex items-center gap-2 bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all"
          >
            <Plus size={20} /> Despesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard label="Saldo Total" value={formatCurrency(stats.balance)} icon={Wallet} trend="+12%" trendType="up" />
        <StatsCard label="Km Rodado" value={formatKm(stats.totalKm)} icon={Navigation} />
        <StatsCard label="Entregas" value={stats.qtyDeliveries.toString()} icon={Package} />
        <StatsCard label="Despesas" value={formatCurrency(stats.totalExpenses)} icon={Receipt} trend="-5%" trendType="down" />
        <StatsCard label="Autonomia" value={stats.autonomy} icon={Fuel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold mb-6 text-white">Performance (Últimos 7 dias)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76e85b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#76e85b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#76e85b' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#76e85b" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold mb-6 text-white">Últimos Registros</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-gray-400 text-sm">
                  <th className="pb-4 font-medium">Data</th>
                  <th className="pb-4 font-medium">Tipo</th>
                  <th className="pb-4 font-medium">Plataforma/Cat</th>
                  <th className="pb-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRecords.map((record: any) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4 text-gray-300">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4">
                      <span className={`capitalize ${record.type === 'delivery' ? 'text-primary' : 'text-red-400'}`}>
                        {record.type === 'delivery' ? 'Entrega' : 'Despesa'}
                      </span>
                    </td>
                    <td className="py-4">
                      {record.type === 'delivery' ? (
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{record.platform}</span>
                          <span className={`w-fit px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${getStatusColor(record.status)}`}>
                            {record.status === 'completed' ? 'Finalizada' : 'Em curso'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">{record.category}</span>
                      )}
                    </td>
                    <td className={`py-4 text-right font-medium ${record.type === 'expense' ? 'text-red-400' : 'text-primary'}`}>
                      {record.type === 'expense' ? '-' : ''}{formatCurrency(record.value || 0)}
                    </td>
                  </tr>
                ))}
                {recentRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
