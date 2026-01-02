
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  expirationDate: string | 'lifetime';
  mustChangePassword?: boolean;
  password?: string; // Em uma API real, isso ficaria apenas no servidor
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
}

export interface Delivery {
  id: string;
  userId: string; // Vínculo com o usuário
  date: string;
  platform: string;
  warehouse?: string; // Específico para Amazon Flex
  startTime: string;
  endTime?: string;
  startKm: number;
  endKm?: number;
  value?: number;
  status: 'ongoing' | 'completed';
}

export interface Expense {
  id: string;
  userId: string; // Vínculo com o usuário
  date: string;
  category: string;
  value: number;
  km: number;
  liters?: number;
  fullTank: boolean;
}

export type View = 'dashboard' | 'reports' | 'settings';

export interface AppState {
  currentUser: User | null;
  users: User[]; // Apenas admin vê/gere
  deliveries: Delivery[];
  expenses: Expense[];
  vehicle: Vehicle;
  categories: string[];
  platforms: string[];
  warehouses: string[]; // Cadastro de barracões para Amazon Flex
  apiUrl?: string;
  isSyncEnabled: boolean;
}
