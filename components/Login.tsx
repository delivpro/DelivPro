
import React, { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { Logo } from './Sidebar';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Logo isCollapsed={false} className="scale-110 mb-2" />
          <p className="text-gray-400 mt-4">Gestão profissional para entregadores</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-dark border border-border rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-primary outline-none transition-all"
                placeholder="exemplo@delivpro.live"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-dark border border-border rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-dark font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-lg"
          >
            Acessar Painel
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            © 2024 DelivPro Express. Acesso restrito a usuários autorizados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
