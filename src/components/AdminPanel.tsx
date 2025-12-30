import { useState, useEffect } from 'react';
import { Users, Lock, UserPlus, ShieldCheck, Copy, Trash2, Clock, Key, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    access_expiry: string | null;
    temp_password_active: boolean;
    phone?: string;
}

export default function AdminPanel() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Estados para Novo Usuário
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [expiryType, setExpiryType] = useState('1_month');
    const [tempPassword, setTempPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setUsers(data);
    };

    const generateTempPassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setTempPassword(password);
    };

    const calculateExpiry = (type: string) => {
        const date = new Date();
        if (type === '1_month') date.setMonth(date.getMonth() + 1);
        if (type === '3_months') date.setMonth(date.getMonth() + 3);
        if (type === '6_months') date.setMonth(date.getMonth() + 6);
        if (type === '1_year') date.setFullYear(date.getFullYear() + 1);
        if (type === 'lifetime') return null;
        return date.toISOString().split('T')[0];
    };

    const handleCreateUser = async () => {
        if (!newEmail || !tempPassword) return alert("Preencha os campos e gere a senha.");

        setLoading(true);
        // Nota: Em produção, isso deve ser feito via Edge Function para segurança total
        const { data, error } = await supabase.auth.admin.createUser({
            email: newEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: newName, role: 'user' }
        });

        if (!error && data.user) {
            await supabase.from('profiles').insert([{
                id: data.user.id,
                full_name: newName,
                email: newEmail,
                phone: newPhone,
                role: 'user',
                access_expiry: calculateExpiry(expiryType),
                temp_password_active: true
            }]);

            alert("Usuário criado com sucesso!");
            fetchUsers();
            setShowModal(false);
        } else {
            alert("Erro ao criar: " + error?.message);
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Senha copiada para a área de transferência!");
    };

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-primary" /> Gestão de Sistema
                    </h1>
                    <p className="text-slate-400 text-sm">Administrador: Controle de motoristas e acessos</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); generateTempPassword(); }}
                    className="bg-primary hover:bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <UserPlus size={20} /> Adicionar Novo Motorista
                </button>
            </header>

            {/* Lista de Usuários Estilo Tabela Premium */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Motorista</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acesso</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Validade</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-primary font-bold">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{user.full_name}</p>
                                                <p className="text-[11px] text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.temp_password_active ? (
                                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-500/20">
                                                <Key size={10} /> Senha Provisória
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-500/20">
                                                <ShieldCheck size={10} /> Ativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm text-slate-300 font-medium">
                                                {user.access_expiry ? new Date(user.access_expiry).toLocaleDateString() : 'Vitalício'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock size={10} /> expira em breve
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="Gerar nova senha">
                                                <RefreshCcw size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Excluir Usuário">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Cadastro */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <UserPlus className="text-primary" /> Novo Cadastro
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all"
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nome do motorista"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all text-sm"
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="email@link.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Telefone</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all text-sm"
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="080-XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Validade do Acesso</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all"
                                    value={expiryType}
                                    onChange={(e) => setExpiryType(e.target.value)}
                                >
                                    <option value="1_month">1 Mês</option>
                                    <option value="3_months">3 Meses</option>
                                    <option value="6_months">6 Meses</option>
                                    <option value="1_year">1 Ano</option>
                                    <option value="lifetime">Vitalício</option>
                                </select>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-2xl border border-dashed border-slate-600 mt-6 group">
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block text-center">Senha Provisória Gerada</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-mono font-bold text-primary tracking-[0.2em]">{tempPassword}</span>
                                    <button
                                        onClick={() => copyToClipboard(tempPassword)}
                                        className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-3 text-center italic">
                                    O motorista será obrigado a trocar esta senha no primeiro acesso.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-primary text-slate-900 font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                                >
                                    {loading ? 'Criando...' : 'Finalizar Cadastro'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}