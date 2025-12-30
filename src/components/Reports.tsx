import { useState } from 'react';
import { FileText, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const generatePDF = async () => {
        if (!dateRange.start || !dateRange.end) return alert("Selecione o período.");
        setLoading(true);

        try {
            // 1. Busca de Dados
            const { data: deliveries } = await supabase
                .from('deliveries')
                .select('*')
                .gte('date', dateRange.start)
                .lte('date', dateRange.end);

            const { data: expenses } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', dateRange.start)
                .lte('date', dateRange.end);

            // 2. Cálculos
            const totalGanhos = deliveries?.reduce((acc, curr) => acc + (curr.earnings_yen || 0), 0) || 0;
            const totalGastos = expenses?.reduce((acc, curr) => acc + (curr.amount_yen || 0), 0) || 0;
            const saldo = totalGanhos - totalGastos;

            // 3. Configuração do PDF
            const doc = new jsPDF();

            // Definição de Cores (RGB)
            const primaryGreen = [118, 232, 91] as [number, number, number];
            const darkGray = [40, 40, 40] as [number, number, number];

            // Cabeçalho
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text('Relatório Financeiro DelivPro', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Período: ${dateRange.start} até ${dateRange.end}`, 14, 30);

            // Tabela de Resumo
            autoTable(doc, {
                startY: 40,
                head: [['Total Ganhos', 'Total Despesas', 'Saldo Líquido']],
                body: [[
                    `¥ ${totalGanhos.toLocaleString('ja-JP')}`,
                    `¥ ${totalGastos.toLocaleString('ja-JP')}`,
                    `¥ ${saldo.toLocaleString('ja-JP')}`
                ]],
                headStyles: { fillColor: primaryGreen, textColor: [0, 0, 0] },
                theme: 'grid'
            });

            // Dados Detalhados
            const tableData = [
                ...(deliveries?.map(d => [d.date, 'Entrega', `+ ¥ ${d.earnings_yen}`, `${d.total_km || 0} km`]) || []),
                ...(expenses?.map(e => [e.date, `Despesa (${e.category})`, `- ¥ ${e.amount_yen}`, '-']) || [])
            ].sort((a, b) => new Date(a[0] as string).getTime() - new Date(b[0] as string).getTime());

            // Tabela Principal
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 15,
                head: [['Data', 'Tipo', 'Valor', 'Km']],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: darkGray }
            });

            // Rodapé com Numeração (Correção do sublinhado vermelho)
            const totalPages = doc.getNumberOfPages(); // Método moderno
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Página ${i} de ${totalPages}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            doc.save(`DelivPro_Relatorio_${dateRange.start}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-primary" /> Relatórios
                </h1>
                <p className="text-slate-400 text-sm">Exportação em formato PDF A4 profissional</p>
            </header>

            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 text-primary">
                    <Filter size={18} />
                    <h2 className="font-bold uppercase text-xs tracking-wider text-slate-300">Filtro por Período</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <CalendarIcon size={14} /> Data Inicial
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-primary [color-scheme:dark]"
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <CalendarIcon size={14} /> Data Final
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-primary [color-scheme:dark]"
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    onClick={generatePDF}
                    disabled={loading}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg",
                        loading ? "bg-slate-700 text-slate-400" : "bg-primary hover:bg-emerald-400 text-slate-900 shadow-primary/20"
                    )}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                        <Download size={20} />
                    )}
                    {loading ? 'Processando...' : 'Baixar Relatório PDF'}
                </button>
            </div>
        </div>
    );
}