
import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { AppState } from '../types';
import { formatCurrency } from '../utils/helpers';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'expense'>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredData = useMemo(() => {
    let combined = [
      ...state.deliveries.map(d => ({ ...d, type: 'delivery' })),
      ...state.expenses.map(e => ({ ...e, type: 'expense' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filterType !== 'all') {
      combined = combined.filter(item => item.type === filterType);
    }

    if (dateRange.start) {
      combined = combined.filter(item => item.date >= dateRange.start);
    }

    if (dateRange.end) {
      combined = combined.filter(item => item.date <= dateRange.end);
    }

    return combined;
  }, [state, filterType, dateRange]);

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.setTextColor(118, 232, 91);
    doc.text('DelivPro - Relatório de Atividades', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    doc.text(`Veículo: ${state.vehicle.model} - ${state.vehicle.plate}`, 14, 35);

    const tableData = filteredData.map(item => [
      new Date(item.date).toLocaleDateString('pt-BR'),
      item.type === 'delivery' ? 'Entrega' : 'Despesa',
      item.type === 'delivery' ? (item as any).platform : (item as any).category,
      item.type === 'delivery' ? ((item as any).status === 'completed' ? 'Finalizada' : 'Em curso') : '-',
      formatCurrency(item.value || 0)
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Data', 'Tipo', 'Plataforma/Cat', 'Status', 'Valor']],
      body: tableData,
      headStyles: { fillColor: [118, 232, 91], textColor: [10, 10, 10] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const totalEarnings = filteredData
      .filter(i => i.type === 'delivery')
      .reduce((acc, i) => acc + (i.value || 0), 0);
    const totalExpenses = filteredData
      .filter(i => i.type === 'expense')
      .reduce((acc, i) => acc + (i.value || 0), 0);

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Ganhos: ${formatCurrency(totalEarnings)}`, 14, finalY);
    doc.text(`Total Despesas: ${formatCurrency(totalExpenses)}`, 14, finalY + 7);
    doc.setFontSize(14);
    doc.text(`Saldo: ${formatCurrency(totalEarnings - totalExpenses)}`, 14, finalY + 16);

    doc.save(`DelivPro_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-gray-400">Analise e exporte seus dados de atividade por plataforma.</p>
        </div>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 bg-primary text-dark font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
        >
          <Download size={20} /> Exportar PDF
        </button>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Registro</label>
          <div className="flex bg-dark p-1 rounded-xl border border-border">
            {(['all', 'delivery', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'all' ? 'Tudo' : t === 'delivery' ? 'Entregas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Início</label>
          <input 
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Fim</label>
          <input 
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setDateRange({ start: '', end: '' }); setFilterType('all'); }}
            className="flex-1 bg-white/5 border border-border text-gray-300 py-2.5 rounded-xl hover:bg-white/10 transition-all"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-border text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Plataforma/Cat</th>
                <th className="px-6 py-4 font-medium">Status/Detalhe</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold uppercase tracking-wider ${item.type === 'delivery' ? 'text-primary' : 'text-red-400'}`}>
                        {item.type === 'delivery' ? item.platform : 'Despesa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400">
                      {item.type === 'delivery' ? `Entrega ${item.status === 'completed' ? 'Finalizada' : 'Ativa'}` : item.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${item.type === 'expense' ? 'text-red-400' : 'text-primary'}`}>
                    {item.type === 'expense' ? '-' : ''}{formatCurrency(item.value || 0)}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
