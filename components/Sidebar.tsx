
import React from 'react';
import { LayoutDashboard, FileText, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

export const Logo: React.FC<{ isCollapsed: boolean; className?: string }> = ({ isCollapsed, className }) => (
  <div className={`flex flex-col items-center justify-center transition-all duration-300 ${className}`}>
    <svg 
      viewBox="0 0 500 350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${isCollapsed ? 'w-12 h-12' : 'w-40 h-auto'}`}
    >
      {/* Linhas de movimento */}
      <rect x="50" y="140" width="40" height="12" rx="6" fill="#76e85b" opacity="0.8" />
      <rect x="40" y="170" width="60" height="12" rx="6" fill="#76e85b" opacity="0.8" />
      <rect x="60" y="200" width="30" height="12" rx="6" fill="#76e85b" opacity="0.8" />
      
      {/* Corpo da Van */}
      <path 
        d="M120 120H330C355 120 375 135 390 160L415 220C425 240 435 250 455 250H465V290C465 300 455 310 445 310H430C430 285 410 265 385 265C360 265 340 285 340 310H200C200 285 180 265 155 265C130 265 110 285 110 310H100C90 310 80 300 80 290V135C80 127 87 120 95 120H120Z" 
        fill="#76e85b" 
      />
      
      {/* Janela e Motorista (Silhueta) */}
      <path d="M320 135H350L395 220H320V135Z" fill="#0a0a0a" fillOpacity="0.4" />
      <circle cx="355" cy="170" r="22" fill="#0a0a0a" fillOpacity="0.6" />
      
      {/* Rodas */}
      <circle cx="155" cy="310" r="35" fill="#76e85b" />
      <circle cx="155" cy="310" r="14" fill="#0a0a0a" />
      <circle cx="385" cy="310" r="35" fill="#76e85b" />
      <circle cx="385" cy="310" r="14" fill="#0a0a0a" />
    </svg>
    
    {!isCollapsed && (
      <div className="mt-2 text-center select-none">
        <div className="flex items-center justify-center font-bold text-4xl tracking-tighter">
          <span className="text-white">Deliv</span>
          <span className="text-[#ef4444]">Pro</span>
        </div>
        <div className="text-[#76e85b] font-express text-2xl -mt-2 italic">Express</div>
      </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className={`hidden md:flex bg-card border-r border-border transition-all duration-300 flex-col h-screen sticky top-0 ${isCollapsed ? 'w-24' : 'w-72'}`}>
      <div className={`p-6 flex flex-col items-center border-b border-border transition-all duration-300 ${isCollapsed ? 'h-24' : 'h-64'} justify-center relative group`}>
        <Logo isCollapsed={isCollapsed} />
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-border border border-border rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all z-10 shadow-lg`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-primary text-dark font-bold shadow-[0_0_20px_rgba(118,232,91,0.2)]' 
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-400/10 hover:text-red-400 transition-all font-medium"
        >
          <LogOut size={22} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
