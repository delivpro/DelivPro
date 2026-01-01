
import React, { useState } from 'react';
import { UserPlus, Search, Shield, Calendar, Trash2, Edit2, Mail, Key, X, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { User } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [tempPasswordVisible, setTempPasswordVisible] = useState<{email: string, pass: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expiration: '1_month'
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', expiration: '1_month' });
    setEditingUser(null);
    setShowModal(false);
  };

  const calculateExpDate = (period: string) => {
    const expDate = new Date();
    if (period === '1_month') expDate.setMonth(expDate.getMonth() + 1);
    else if (period === '3_months') expDate.setMonth(expDate.getMonth() + 3);
    else if (period === '1_year') expDate.setFullYear(expDate.getFullYear() + 1);
    return period === 'lifetime' ? 'lifetime' : expDate.toISOString();
  };

  const generatePass = () => Math.random().toString(36).slice(-8);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      expiration: user.expirationDate === 'lifetime' ? 'lifetime' : '1_month'
    });
    setShowModal(true);
  };

  const handleResetPassword = (user: User) => {
    if (confirm(`Deseja resetar a senha de ${user.name}? O usuário será obrigado a trocar a senha no próximo acesso.`)) {
      const newPass = generatePass();
      const updatedUser: User = {
        ...user,
        password: newPass,
        mustChangePassword: true
      };
      onUpdateUser(updatedUser);
      setTempPasswordVisible({ email: user.email, pass: newPass });
    }
  };

  const handleCopyPass = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        expirationDate: calculateExpDate(formData.expiration)
      };
      onUpdateUser(updatedUser);
      alert('Usuário atualizado com sucesso!');
    } else {
      const tempPassword = generatePass();
      onAddUser({
        name: formData.name,
        email: formData.email,
        role: 'user',
        expirationDate: calculateExpDate(formData.expiration),
        mustChangePassword: true,
        password: tempPassword
      });
      setTempPasswordVisible({ email: formData.email, pass: tempPassword });
    }
    
    resetForm();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Alerta de Senha Provisória Gerada */}
      {tempPasswordVisible && (
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
          <div className="p-3 bg-primary/20 rounded-full text-primary">
            <Key size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-primary font-bold text-lg flex items-center gap-2 justify-center md:justify-start">
              <CheckCircle2 size={18} /> Senha Provisória Gerada
            </h3>
            <p className="text-gray-400 text-sm mt-1">Copie os dados abaixo para o usuário:</p>
            
            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              {/* Badge E-mail */}
              <div className="flex items-center bg-dark rounded-lg border border-border overflow-hidden">
                <span className="select-none px-2 py-1 text-[9px] font-bold text-gray-500 bg-white/5 border-r border-border uppercase tracking-tight">Email</span>
                <span className="px-3 py-1 text-xs text-gray-300 font-mono select-all">
                  {tempPasswordVisible.email}
                </span>
              </div>
              
              {/* Badge Senha - Melhorado para cópia única */}
              <div className="flex items-center bg-dark rounded-lg border border-border overflow-hidden group/pass">
                <span className="select-none px-2 py-1 text-[9px] font-bold text-gray-500 bg-white/5 border-r border-border uppercase tracking-tight">Senha</span>
                <span className="px-3 py-1 text-xs font-mono text-primary select-all cursor-text">
                  {tempPasswordVisible.pass}
                </span>
                <button 
                  onClick={() => handleCopyPass(tempPasswordVisible.pass)}
                  className={`p-1.5 border-l border-border transition-all flex items-center gap-1.5 px-3 ${copied ? 'bg-primary text-dark font-bold' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                  title="Copiar apenas a senha"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span className="text-[10px] uppercase">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="text-[10px] uppercase">Copiar Senha</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setTempPasswordVisible(null); setCopied(false); }}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar usuários por nome ou email..."
            className="w-full bg-dark border border-border rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-primary text-dark font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all whitespace-nowrap"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-border text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Usuário</th>
              <th className="px-6 py-4 font-medium">Nível</th>
              <th className="px-6 py-4 font-medium">Expiração</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-600" />
                    {user.expirationDate === 'lifetime' ? 'Vitalício' : new Date(user.expirationDate).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <button 
                    onClick={() => handleResetPassword(user)}
                    title="Resetar Senha"
                    className="text-gray-500 hover:text-yellow-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Key size={18} />
                  </button>
                  <button 
                    onClick={() => handleEditClick(user)}
                    title="Editar Usuário"
                    className="text-gray-500 hover:text-primary p-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={18} />
                  </button>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      title="Apagar Usuário"
                      className="text-gray-500 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl p-6 shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Editar Usuário e Acesso' : 'Cadastrar Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {editingUser ? 'Renovar/Alterar Validade' : 'Validade do Acesso'}
                </label>
                <select 
                  className="w-full bg-dark border border-border rounded-xl px-4 py-2 text-white outline-none focus:border-primary"
                  value={formData.expiration}
                  onChange={e => setFormData({...formData, expiration: e.target.value})}
                >
                  <option value="1_month">1 Mês (a partir de hoje)</option>
                  <option value="3_months">3 Meses (a partir de hoje)</option>
                  <option value="1_year">1 Ano (a partir de hoje)</option>
                  <option value="lifetime">Vitalício</option>
                </select>
                {editingUser && editingUser.expirationDate !== 'lifetime' && (
                  <p className="text-[10px] text-gray-500 mt-1 italic">
                    Expiração atual: {new Date(editingUser.expirationDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-400 font-bold hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-dark font-bold py-3 rounded-xl hover:opacity-90">
                  {editingUser ? 'Salvar Alterações' : 'Criar Acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
