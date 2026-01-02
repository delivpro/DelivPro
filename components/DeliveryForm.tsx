
import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, Warehouse } from 'lucide-react';
import { Delivery } from '../types';

interface DeliveryFormProps {
  onClose: () => void;
  onSubmit: (delivery: Partial<Delivery>) => void;
  activeDelivery?: Delivery;
  platforms: string[];
  warehouses: string[];
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onClose, onSubmit, activeDelivery, platforms, warehouses }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: platforms[0] || '',
    warehouse: warehouses[0] || '',
    startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    startKm: '',
    endTime: '',
    endKm: '',
    value: ''
  });

  const isAmazonFlex = formData.platform === 'Amazon Flex';

  useEffect(() => {
    if (activeDelivery) {
      setFormData({
        ...formData,
        date: activeDelivery.date,
        platform: activeDelivery.platform,
        warehouse: activeDelivery.warehouse || '',
        startTime: activeDelivery.startTime,
        startKm: activeDelivery.startKm.toString(),
        value: activeDelivery.value?.toString() || '',
        endTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  }, [activeDelivery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDelivery) {
      onSubmit({
        id: activeDelivery.id,
        endTime: formData.endTime,
        endKm: Number(formData.endKm),
        // No Amazon Flex, o valor já foi gravado no início
        value: isAmazonFlex ? activeDelivery.value : Number(formData.value),
        status: 'completed'
      });
    } else {
      onSubmit({
        date: formData.date,
        platform: formData.platform,
        warehouse: isAmazonFlex ? formData.warehouse : undefined,
        startTime: formData.startTime,
        startKm: Number(formData.startKm),
        value: isAmazonFlex ? Number(formData.value) : undefined,
        status: 'ongoing'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activeDelivery ? <CheckCircle2 className="text-primary" /> : <Play className="text-primary" />}
            {activeDelivery ? 'Finalizar Entrega' : 'Nova Entrega'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!activeDelivery ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Plataforma</label>
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none appearance-none"
                    required
                  >
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isAmazonFlex && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Barracão</label>
                  <select 
                    value={formData.warehouse}
                    onChange={e => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione um barracão</option>
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora Início</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Km Inicial</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 54200"
                    value={formData.startKm}
                    onChange={e => setFormData({ ...formData, startKm: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>

              {isAmazonFlex && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Valor do Bloco (¥)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 12000"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary outline-none"
                    required
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Status: Em execução ({activeDelivery.platform})</p>
                {activeDelivery.warehouse && (
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Warehouse size={12} /> {activeDelivery.warehouse}
                  </p>
                )}
                <p className="text-sm text-gray-300">Iniciado em {activeDelivery.startTime} • {activeDelivery.startKm} km</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora Final</label>
                  <input 
                    type="time" 
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Km Final</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 54350"
                    value={formData.endKm}
                    onChange={e => setFormData({ ...formData, endKm: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-2.5 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>
              {!isAmazonFlex && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Valor Recebido (¥)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 12000"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-dark border border-border rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary outline-none"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary text-dark font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {activeDelivery ? <CheckCircle2 size={20} /> : <Play size={20} />}
              {activeDelivery ? 'Finalizar Entrega' : 'Iniciar Entrega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
