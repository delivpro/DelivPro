import { useState, useEffect } from 'react';
import { Truck, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Importação do client que você configurou
import { cn } from '../lib/utils';

export default function DeliveryForm() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'active'>('idle');
    const [kmInicial, setKmInicial] = useState<number | ''>('');
    const [kmFinal, setKmFinal] = useState<number | ''>('');
    const [ganhos, setGanhos] = useState<number | ''>('');
    const [startTime, setStartTime] = useState<string | null>(null);

    // Carregar entrega em andamento ao abrir o app
    useEffect(() => {
        const checkActiveDelivery = async () => {
            const { data } = await supabase
                .from('deliveries')
                .select('*')
                .eq('status', 'in_progress')
                .single();

            if (data) {
                setStatus('active');
                setKmInicial(data.start_km);
                setStartTime(data.start_time);
            }
        };
        checkActiveDelivery();
    }, []);

    const handleStart = async () => {
        if (!kmInicial || kmInicial <= 0) return alert("Insira um Km Inicial válido.");

        setLoading(true);
        const { error } = await supabase.from('deliveries').insert([{
            start_km: kmInicial,
            start_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'in_progress',
            date: new Date().toISOString().split('T')[0]
        }]);

        if (!error) {
            setStatus('active');
            setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        setLoading(false);
    };

    const handleFinish = async () => {
        if (!kmFinal || (kmInicial && kmFinal <= kmInicial)) {
            return alert("Km Final deve ser maior que o Inicial.");
        }
        if (!ganhos || ganhos < 0) return alert("Insira o valor dos ganhos.");

        setLoading(true);
        const { error } = await supabase
            .from('deliveries')
            .update({
                end_km: kmFinal,
                end_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                earnings_yen: ganhos,
                status: 'completed'
            })
            .eq('status', 'in_progress');

        if (!error) {
            setStatus('idle');
            setKmInicial('');
            setKmFinal('');
            setGanhos('');
            alert("Bloco finalizado com sucesso! ¥" + ganhos);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-lg mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                    Gestão de Entrega
                </h1>
                <p className="text-slate-400 text-sm">Registre suas atividades diárias</p>
            </header>

            <div className={cn(
                "bg-slate-800/50 rounded-2xl p-6 border backdrop-blur-sm shadow-2xl transition-all duration-500",
                status === 'active' ? "border-primary/30 shadow-primary/5" : "border-slate-700"
            )}>
                {status === 'idle' ? (
                    <div className="space-y-6 text-center">
                        <div className="relative">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Truck size={40} className="text-primary" />
                            </div>
                            <div className="absolute top-0 right-1/3 w-3 h-3 bg-slate-500 rounded-full border-2 border-slate-800" />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-slate-100">Pronto para rodar?</h2>
                            <p className="text-slate-400">Insira a quilometragem do painel.</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Km Inicial</label>
                                <input
                                    type="number"
                                    value={kmInicial}
                                    onChange={(e) => setKmInicial(Number(e.target.value))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-xl text-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Ex: 12500"
                                />
                            </div>

                            <button
                                onClick={handleStart}
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                            >
                                <Play size={20} fill="currentColor" /> {loading ? 'Iniciando...' : 'Iniciar Turno'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </div>
                                <span className="text-primary font-bold">Entrega Ativa</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                <Clock size={14} />
                                <span>Desde {startTime}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Km Final</label>
                                <input
                                    type="number"
                                    value={kmFinal}
                                    onChange={(e) => setKmFinal(Number(e.target.value))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-xl text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="Ex: 12650"
                                />
                            </div>

                            <div className="text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Ganhos do Bloco (¥)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">¥</span>
                                    <input
                                        type="number"
                                        value={ganhos}
                                        onChange={(e) => setGanhos(Number(e.target.value))}
                                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 pl-10 text-xl text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-slate-900/50 rounded-lg flex items-start gap-2 border border-slate-700/50">
                                <AlertCircle size={16} className="text-slate-500 mt-0.5" />
                                <p className="text-[11px] text-slate-500 italic">
                                    Certifique-se de que os dados estão corretos. O cálculo de autonomia será afetado por este registro.
                                </p>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="w-full py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl"
                            >
                                <CheckCircle size={20} /> {loading ? 'Finalizando...' : 'Finalizar e Salvar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}