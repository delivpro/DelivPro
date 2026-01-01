
import { Delivery, Expense } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);
};

export const formatKm = (value: number) => {
  return `${value.toLocaleString('pt-BR')} km`;
};

export const calculateAutonomy = (expenses: Expense[]): number | null => {
  const fuelExpenses = expenses
    .filter(e => e.category === 'Combustível' && e.fullTank && e.liters && e.liters > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (fuelExpenses.length < 2) return null;

  const current = fuelExpenses[0];
  const previous = fuelExpenses[1];

  const kmTraveled = current.km - previous.km;
  if (kmTraveled <= 0) return null;

  return kmTraveled / current.liters!;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-primary bg-primary/10';
    case 'ongoing': return 'text-yellow-500 bg-yellow-500/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};
