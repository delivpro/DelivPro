import { useState } from 'react';
import { Camera, Receipt, Check, Save, Fuel, Settings, Droplets } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const CATEGORIAS = [
    { id: 'Combustível', icon: Fuel, color: 'text-blue-400' },
    { id: 'Manutenção', icon: Settings, color: 'text-amber-400' },
    { id: 'Troca de Óleo', icon: Droplets, color: 'text-red-400' },
    { id: 'Alimentação', icon: Receipt, color: 'text-emerald-400' },
    { id: 'Outros', icon: Receipt, color: 'text-slate-400' },
];

export default function ExpenseForm() {
    const [loading, setLoading] = useState(false);
    const [categoria, setCategoria] = useState('Combustível');
    const [valor, setValor] = useState<number | ''>('');
    const [km, setKm] = useState<number | ''>('');
    const [litros, setLitros] = useState<number | ''>('');
    const [tanqueCheio, setTanqueCheio] = useState(false);
    const [proximaTrocaOleo, setProximaTrocaOleo] = useState('3000');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valor || !km) return alert("Preencha o valor e a quilometragem.");

        setLoading(true);

        // Preparar dados para o Supabase
        const expenseData = {
            date: new Date().toISOString().split('T')[0],
            category: categoria,
            amount_yen: valor,
            current_km: km,
            liters: categoria === 'Combustível' ? litros : null,
            is_full_tank: categoria === 'Combustível' ? tanqueCheio : false,
            // Se for troca de óleo, calculamos a próxima km baseado na escolha
            next_maintenance_km: categoria === 'Troca de Óleo' ? (Number(km) + Number(proximaTrocaOleo)) : null
        };

        const { error } = await supabase.from('expenses').insert([expenseData]);

        if (!error) {
            alert("Despesa registada com sucesso!");
            setValor('');
            setKm('');
            setLitros('');
            setTanqueCheio(false);
        } else {
            alert("Erro ao salvar: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-lg mx-auto pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                    Registar Despesa
                </h1>
                <p className="text-slate-400 text-sm">Controle os seus gastos e manutenção</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de Categoria (Horizontal Scrollable) */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIAS.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoria(cat.id)}
                            className={cn(
                                "flex-none flex flex-col items-center gap-2 p-4 rounded-xl border transition-all w-24",
                                categoria === cat.id
                                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(118,232,91,0.1)]"
                                    : "bg-slate-800/50 border-slate-700 text-slate-400"
                            )}
                        >
                            <cat.icon size={24} />
                            <span className="text-[10px] font-bold uppercase">{cat.id}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
                    {/* Valor em Ienes */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Valor Total</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">¥</span>
                            <input
                                type="number"
                                required
                                value={valor}
                                onChange={(e) => setValor(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pl-10 text-xl text-white outline-none focus:border-primary transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Km Atual */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Quilometragem Atual (Painel)</label>
                        <input
                            type="number"
                            required
                            value={km}
                            onChange={(e) => setKm(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xl text-white outline-none focus:border-primary"
                            placeholder="Ex: 15400"
                        />
                    </div>

                    {/* Campos Específicos para Combustível */}
                    {categoria === 'Combustível' && (
                        <div className="pt-4 border-t border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Litros</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={litros}
                                        onChange={(e) => setLitros(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={tanqueCheio}
                                                onChange={() => setTanqueCheio(!tanqueCheio)}
                                            />
                                            <div className={cn(
                                                "w-6 h-6 rounded border-2 transition-all flex items-center justify-center",
                                                tanqueCheio ? "bg-primary border-primary" : "border-slate-600"
                                            )}>
                                                {tanqueCheio && <Check size={16} className="text-slate-900" />}
                                            </div>
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium">Tanque Cheio?</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campos Específicos para Troca de Óleo */}
                    {categoria === 'Troca de Óleo' && (
                        <div className="pt-4 border-t border-slate-700 animate-in fade-in">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Próxima troca em:</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['1500', '3000', '5000'].map((range) => (
                                    <button
                                        key={range}
                                        type="button"
                                        onClick={() => setProximaTrocaOleo(range)}
                                        className={cn(
                                            "py-2 rounded-lg border text-xs font-bold transition-all",
                                            proximaTrocaOleo === range ? "bg-red-500/20 border-red-500 text-red-500" : "bg-slate-900 border-slate-700 text-slate-500"
                                        )}
                                    >
                                        +{range} km
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botão de OCR (Simulação de Rapidez) */}
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700/50 text-slate-300 rounded-xl border border-dashed border-slate-500 hover:bg-slate-700 transition-all">
                    <Camera size={18} />
                    <span className="text-sm font-medium">Ler Recibo com IA</span>
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Save size={20} /> {loading ? 'A guardar...' : 'Confirmar Registo'}
                </button>
            </form>
        </div>
    );
}