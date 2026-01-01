
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

const Logo: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
  <svg 
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-32 h-32'}`}
  >
    {/* Van Group with Speed Lines */}
    <g transform="translate(40, 40) scale(0.85)">
      {/* Speed lines (matching the image) */}
      <rect x="0" y="120" width="50" height="15" rx="7.5" fill="#76e85b" />
      <rect x="-20" y="150" width="70" height="15" rx="7.5" fill="#76e85b" />
      <rect x="0" y="180" width="50" height="15" rx="7.5" fill="#76e85b" />
      
      {/* Van Body */}
      <path 
        d="M80 80H350C380 80 400 100 415 130L440 180H460C475 180 485 190 485 205V280C485 295 475 305 460 305H440C440 280 420 260 395 260C370 260 350 280 350 305H200C200 280 180 260 155 260C130 260 110 280 110 305H85C70 305 60 295 60 280V95C60 87 67 80 75 80H80Z" 
        fill="#76e85b" 
      />
      
      {/* Window */}
      <path 
        d="M330 100H360L405 180H330V100Z" 
        fill="#0a0a0a" 
        fillOpacity="0.4" 
      />
      
      {/* Driver Detail */}
      <path 
        d="M345 130C345 118 355 110 365 110C375 110 385 118 385 130C385 142 375 150 365 150C355 150 345 142 345 130Z" 
        fill="#76e85b" 
      />
      <path 
        d="M350 160C340 160 330 170 330 185H400C400 170 390 160 380 160H350Z" 
        fill="#76e85b" 
      />
      
      {/* Wheels */}
      <circle cx="155" cy="305" r="30" fill="#76e85b" />
      <circle cx="155" cy="305" r="12" fill="#0a0a0a" />
      <circle cx="395" cy="305" r="30" fill="#76e85b" />
      <circle cx="395" cy="305" r="12" fill="#0a0a0a" />
    </g>
    
    {!isCollapsed && (
      <text 
        x="256" 
        y="460" 
        textAnchor="middle"
        fill="#76e85b" 
        style={{ font: 'bold 90px Inter, sans-serif', letterSpacing: '-2px' }}
      >
        DelivPro
      </text>
    )}
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className={`bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-4 flex flex-col items-center border-b border-border transition-all duration-300 ${isCollapsed ? 'h-24' : 'h-48'} justify-center relative group`}>
        <div className="transition-transform duration-300 group-hover:scale-105">
          <Logo isCollapsed={isCollapsed} />
        </div>
        
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
