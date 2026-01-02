
import React, { useState } from 'react';
import { Truck, Tag, Plus, Trash2, Save, Layout, Database, Globe, RefreshCw, Users, Warehouse } from 'lucide-react';
import { AppState, Vehicle, User } from '../types';
import UserManagement from './UserManagement';

interface SettingsProps {
  state: AppState;
  onUpdateVehicle: (v: Vehicle) => void;
  onAddCategory: (c: string) => void;
  onRemoveCategory: (c: string) => void;
  onAddPlatform: (p: string) => void;
  onRemovePlatform: (p: string) => void;
  onAddWarehouse: (w: string) => void;
  onRemoveWarehouse: (w: string) => void;
  onUpdateApiSettings: (url: string, enabled: boolean) => void;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  state, 
  onUpdateVehicle, 
  onAddCategory, 
  onRemoveCategory,
  onAddPlatform,
  onRemovePlatform,
  onAddWarehouse,
  onRemoveWarehouse,
  onUpdateApiSettings,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const isAdmin = state.currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>(isAdmin ? 'users' : 'profile');
  const [vehicleData, setVehicleData] = useState(state.vehicle);
  const [newCat, setNewCat] = useState('');
  const [newPlat, setNewPlat] = useState('');
  const [newWh, setNewWh] = useState('');
  const [apiUrl, setApiUrl] = useState(state.apiUrl || '');
  const [syncEnabled, setSyncEnabled] = useState(state.isSyncEnabled);

  return (
    <div className="p-8 space-y-8 animate-fadeIn max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      {isAdmin && (
        <div className="flex bg-card p-1 rounded-xl border border-border w-fit">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-dark' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Users size={18} /> Usuários
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-dark' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Layout size={18} /> Meu Perfil
          </button>
        </div>
      )}

      {activeTab === 'users' && isAdmin ? (
        <UserManagement 
          users={state.users} 
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      ) : (
        <>
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
            {/* Banco de Dados - Visível apenas para Admin */}
            {isAdmin && (
              <div className="bg-card p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="text-primary" />
                  <h2 className="text-xl font-bold text-white">Conexão MySQL</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">URL da API</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={e => setApiUrl(e.target.value)}
                      className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-dark/50 rounded-xl border border-border/50">
                    <input type="checkbox" checked={syncEnabled} onChange={e => setSyncEnabled(e.target.checked)} className="w-5 h-5 rounded border-border bg-dark text-primary" />
                    <span className="text-sm text-gray-300">Ativar sincronização</span>
                  </label>
                  <button onClick={() => onUpdateApiSettings(apiUrl, syncEnabled)} className="w-full bg-primary text-dark font-bold py-2.5 rounded-xl hover:opacity-90">
                    Salvar Configurações
                  </button>
                </div>
              </div>
            )}

            {/* Veículo - Visível para todos */}
            <div className={`bg-card p-6 rounded-2xl border border-border ${!isAdmin ? 'max-w-md' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <Truck className="text-primary" />
                <h2 className="text-xl font-bold text-white">Veículo</h2>
              </div>
              <div className="space-y-4">
                <input type="text" value={vehicleData.model} onChange={e => setVehicleData({...vehicleData, model: e.target.value})} className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" placeholder="Modelo" />
                <input type="text" value={vehicleData.plate} onChange={e => setVehicleData({...vehicleData, plate: e.target.value})} className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" placeholder="Placa" />
                <button onClick={() => onUpdateVehicle(vehicleData)} className="w-full bg-white/10 text-white font-bold py-2.5 rounded-xl hover:bg-white/20">Salvar Veículo</button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Apps */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-4">Plataformas</h3>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newPlat} onChange={e => setNewPlat(e.target.value)} className="flex-1 bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary" />
                <button onClick={() => {if(newPlat) {onAddPlatform(newPlat); setNewPlat('');}}} className="p-3 bg-primary text-dark rounded-xl"><Plus size={20}/></button>
              </div>
              <div className="space-y-2">
                {state.platforms.map(p => (
                  <div key={p} className="flex items-center justify-between p-3 bg-dark rounded-xl border border-border">
                    <span className="text-gray-300 text-sm">{p}</span>
                    <button onClick={() => onRemovePlatform(p)} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Barracões Amazon Flex */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-white">Barracões (Flex)</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newWh} onChange={e => setNewWh(e.target.value)} className="flex-1 bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary" placeholder="Novo barracão" />
                <button onClick={() => {if(newWh) {onAddWarehouse(newWh); setNewWh('');}}} className="p-3 bg-primary text-dark rounded-xl"><Plus size={20}/></button>
              </div>
              <div className="space-y-2">
                {state.warehouses.map(w => (
                  <div key={w} className="flex items-center justify-between p-3 bg-dark rounded-xl border border-border">
                    <span className="text-gray-300 text-sm">{w}</span>
                    <button onClick={() => onRemoveWarehouse(w)} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
                {state.warehouses.length === 0 && <p className="text-xs text-gray-500 italic text-center py-4">Nenhum barracão cadastrado.</p>}
              </div>
            </div>

            {/* Categorias */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-white mb-4">Categorias</h3>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} className="flex-1 bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary" />
                <button onClick={() => {if(newCat) {onAddCategory(newCat); setNewCat('');}}} className="p-3 bg-white/10 text-white rounded-xl border border-white/10"><Plus size={20}/></button>
              </div>
              <div className="space-y-2">
                {state.categories.map(c => (
                  <div key={c} className="flex items-center justify-between p-3 bg-dark rounded-xl border border-border">
                    <span className="text-gray-300 text-sm">{c}</span>
                    <button onClick={() => onRemoveCategory(c)} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
