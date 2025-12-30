import { useState, useEffect } from 'react';
import { Car, Calendar, CreditCard, Bell, Save, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState({
        plate: '',
        model: '',
        shaken_expiry: '',
    });

    // Carregar dados do veículo ao montar o componente
    useEffect(() => {
        const fetchVehicle = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) setVehicle(data);
            }
        };
        fetchVehicle();
    }, []);

    const handleSaveVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('vehicles')
            .upsert({
                user_id: user?.id,
                plate: vehicle.plate,
                model: vehicle.model,
                shaken_expiry: vehicle.shaken_expiry,
                updated_at: new Date().toISOString(),
            });

        if (!error) {
            alert("Configurações do veículo atualizadas!");
        } else {
            alert("Erro ao salvar: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-slate-400 text-sm">Gerencie seu perfil e dados do veículo</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu Lateral de Navegação interna (Opcional para Desktop) */}
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-medium">
                        <Car size={18} /> Veículo
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
                        <Bell size={18} /> Notificações
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
                        <CreditCard size={18} /> Assinatura
                    </button>
                </div>

                {/* Área de Formulário Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveVehicle} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
                            <div className="p-2 bg-slate-700 rounded-lg text-primary">
                                <Car size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Informações do Veículo</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Modelo / Marca</label>
                                <input
                                    type="text"
                                    value={vehicle.model}
                                    onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all"
                                    placeholder="Ex: Toyota Prius"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Placa</label>
                                <input
                                    type="text"
                                    value={vehicle.plate}
                                    onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all"
                                    placeholder="Ex: ABC-123"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary" /> Próximo Shaken (Expiração)
                            </label>
                            <input
                                type="date"
                                value={vehicle.shaken_expiry}
                                onChange={(e) => setVehicle({ ...vehicle, shaken_expiry: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-all [color-scheme:dark]"
                            />
                            <p className="text-[10px] text-slate-500 italic px-1">
                                O sistema enviará alertas visuais 30 e 15 dias antes desta data.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>

                    {/* Área Perigosa / Gestão de Dados */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={18} className="text-red-500" />
                            <h3 className="text-sm font-bold text-red-500 uppercase">Zona de Perigo</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Ao excluir os dados do veículo, todos os registros de autonomia vinculados poderão ser perdidos.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={16} /> LIMPAR TODOS OS DADOS DO VEÍCULO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}