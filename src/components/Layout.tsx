import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Truck, DollarSign, Settings, ShieldCheck, PlusCircle, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

// Tipagem das Props para suportar o controle de Admin vindo do App.tsx
interface LayoutProps {
    isAdmin?: boolean;
}

const NavItem = ({ to, icon: Icon, label, mobile = false }: { to: string; icon: any; label: string; mobile?: boolean }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                isActive
                    ? "bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(118,232,91,0.1)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                mobile && "flex-col gap-1 text-[10px] p-2 flex-1"
            )}
        >
            <Icon size={mobile ? 20 : 22} className={cn(isActive && "animate-pulse")} />
            <span className={cn(mobile ? "uppercase tracking-tighter" : "text-sm")}>{label}</span>
        </Link>
    );
};

export default function Layout({ isAdmin = false }: LayoutProps) {
    return (
        <div className="flex h-screen bg-[#0f172a] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-xl">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="DelivPro" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-black tracking-tighter text-white">
                            Deliv<span className="text-primary">Pro</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    <NavItem to="/" icon={Home} label="Dashboard" />

                    {/* Rotas visíveis apenas para Motoristas */}
                    {!isAdmin && (
                        <>
                            <NavItem to="/entrega" icon={Truck} label="Entregas" />
                            <NavItem to="/despesa" icon={DollarSign} label="Despesas" />
                            <NavItem to="/relatorio" icon={BarChart3} label="Relatórios" />
                        </>
                    )}

                    {/* Rota visível apenas para Admin */}
                    {isAdmin && (
                        <NavItem to="/admin" icon={ShieldCheck} label="Painel Admin" />
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800/60 space-y-1">
                    <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-gradient-to-b from-slate-900 to-[#0f172a]">
                {/* O Outlet renderiza o componente da rota atual */}
                <Outlet />
            </main>

            {/* Mobile Bottom Nav - Otimizado para PWA */}
            <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/50 flex justify-around items-end px-2 pb-safe z-50 h-20">
                <NavItem to="/" icon={Home} label="Início" mobile />

                {!isAdmin ? (
                    <>
                        <NavItem to="/entrega" icon={Truck} label="Entregas" mobile />

                        {/* Botão Central Flutuante (Action Button) */}
                        <div className="relative -top-8 px-2">
                            <Link
                                to="/entrega"
                                className="bg-primary text-slate-900 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(118,232,91,0.4)] flex items-center justify-center transition-transform active:scale-90"
                            >
                                <PlusCircle size={32} />
                            </Link>
                        </div>

                        <NavItem to="/despesa" icon={DollarSign} label="Gastos" mobile />
                        <NavItem to="/relatorio" icon={BarChart3} label="PDF" mobile />
                    </>
                ) : (
                    <>
                        <NavItem to="/admin" icon={ShieldCheck} label="Admin" mobile />
                        <NavItem to="/configuracoes" icon={Settings} label="Ajustes" mobile />
                    </>
                )}
            </nav>
        </div>
    );
}