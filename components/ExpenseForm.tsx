
import React, { useState } from 'react';
import { X, Receipt, Fuel } from 'lucide-react';
import { Expense } from '../types';
import { INITIAL_CATEGORIES } from '../constants';

interface ExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: Partial<Expense>) => void;
  categories: string[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Combustível',
    value: '',
    km: '',
    liters: '',
    fullTank: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value),
      km: Number(formData.km),
      liters: formData.liters ? Number(formData.liters) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="text-primary" />
            Nova Despesa
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none appearance-none"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valor (¥)</label>
              <input 
                type="number" 
                placeholder="0"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Km Atual</label>
              <input 
                type="number" 
                placeholder="Ex: 54350"
                value={formData.km}
                onChange={e => setFormData({ ...formData, km: e.target.value })}
                className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                required
              />
            </div>
          </div>

          {formData.category === 'Combustível' && (
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <Fuel size={18} className="text-primary" />
                <span className="text-sm font-bold text-primary">Informações de Abastecimento</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Litros</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ex: 35.5"
                  value={formData.liters}
                  onChange={e => setFormData({ ...formData, liters: e.target.value })}
                  className="w-full bg-dark border border-border rounded-xl px-4 py-2 text-white focus:border-primary outline-none"
                  required={formData.category === 'Combustível'}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.fullTank}
                  onChange={e => setFormData({ ...formData, fullTank: e.target.checked })}
                  className="w-5 h-5 rounded border-border bg-dark text-primary focus:ring-primary focus:ring-offset-dark"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Tanque Cheio (para cálculo de autonomia)</span>
              </label>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-white text-dark font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Gravar Despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
