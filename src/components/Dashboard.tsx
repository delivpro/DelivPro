import { useState, useEffect } from 'react';
import { TrendingUp, Fuel, AlertTriangle, IndianRupee, Map, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useCalculations } from '../hooks/useCalculations';

// Mock de dados para o gráfico - No futuro virá do Supabase filtrado por [Semana | Mês | Ano]
const mockData = [
    { name: 'Seg', valor: 4000 },
    { name: 'Ter', valor: 3000 },
    { name: 'Qua', valor: 2000 },
    { name: 'Qui', valor: 2780 },
    { name: 'Sex', valor: 1890 },
    { name: 'Sab', valor: 2390 },
    { name: 'Dom', valor: 3490 },
];

const InfoCard = ({ title, value, sub, icon: Icon, colorClass, status }: any) => (
    <div className={cn(
        "relative overflow-hidden rounded-xl bg-slate-800/50 border p-6 backdrop-blur-sm transition-all duration-300",
        status === 'critical' ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]" :
            status === 'warning' ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]" :
                "border-slate-700 hover:border-primary/30"
    )}>
        {/* Glow Effect Background */}
        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl", colorClass)} />

        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
            </div>
            <div className={cn("p-3 rounded-lg bg-slate-900/50",
                status === 'critical' ? "text-red-400" :
                    status === 'warning' ? "text-amber-400" : "text-primary"
            )}>
                <Icon size={20} />
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className={cn("font-medium",
                status === 'critical' ? "text-red-400" :
                    status === 'warning' ? "text-amber-400" : "text-emerald-400"
            )}>
                {sub}
            </span>
        </div>
    </div>
);

export default function Dashboard() {
    const { checkOilChangeStatus } = useCalculations();

    // Estados de exemplo (Deverão vir do seu contexto/Supabase)
    const [stats, setStats] = useState({
        faturamento: 45000,
        autonomia: 12.5,
        kmAtual: 15500,
        proximaTroca: 15900, // Exemplo: 400km para a troca (Warning)
    });

    const statusOleo = checkOilChangeStatus(stats.kmAtual, stats.proximaTroca);

    // Formatador de Moeda JPY
    const formatJPY = (val: number) =>
        new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                        Painel DelivPro
                    </h1>
                    <p className="text-slate-400 text-sm">Controle de ganhos e manutenção veicular</p>
                </div>

                {/* Filtros de Tempo Rápidos */}
                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    {['Semana', 'Mês', 'Ano'].map((periodo) => (
                        <button key={periodo} className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-md hover:bg-slate-700">
                            {periodo}
                        </button>
                    ))}
                </div>
            </header>

            {/* Grid de Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard
                    title="Saldo"
                    value={formatJPY(stats.faturamento)}
                    sub="Este mês"
                    icon={TrendingUp}
                    colorClass="bg-emerald-500"
                />
                <InfoCard
                    title="Autonomia (Tanque Cheio)"
                    value={`${stats.autonomia} km/L`}
                    sub="Média atual"
                    icon={Fuel}
                    colorClass="bg-blue-500"
                />
                <InfoCard
                    title="Óleo do Motor"
                    value={statusOleo === 'expired' ? 'VENCIDO' : `Em ${stats.proximaTroca - stats.kmAtual} km`}
                    sub={statusOleo === 'ok' ? 'Status: Normal' : 'Troca Necessária'}
                    icon={AlertTriangle}
                    colorClass={statusOleo === 'expired' ? "bg-red-500" : "bg-amber-500"}
                    status={statusOleo}
                />
                <InfoCard
                    title="Quilometragem"
                    value={`${stats.kmAtual.toLocaleString()} km`}
                    sub="Km total rodado"
                    icon={Map}
                    colorClass="bg-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Performance */}
                <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-800/30 p-6 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-100">
                        <TrendingUp size={20} className="text-primary" />
                        Ganhos vs Despesas
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#76e85b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#76e85b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `¥${(val / 1000)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#76e85b' }}
                                    formatter={(value: any) => [formatJPY(value), 'Ganhos']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke="#76e85b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValor)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Últimos 5 Registros (Tabela Rápida) */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold mb-4 text-slate-100">Últimos Registros</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Entrega Amazon</p>
                                        <p className="text-[10px] text-slate-500 uppercase">24 Out, 2023</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-200">¥8.500</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:text-white transition-colors border border-primary/20 rounded-lg hover:bg-primary/10">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
}