
import { AppState, User } from './types';

export const ADMIN_MASTER: User = {
  id: 'admin-001',
  name: 'Administrador Master',
  email: 'admin@delivpro.live',
  role: 'admin',
  expirationDate: 'lifetime',
  mustChangePassword: false,
  password: '@nDre428'
};

export const INITIAL_CATEGORIES = [
  'Combustível', 'Manutenção', 'Alimentação', 'Estacionamento', 'Pedágio', 'Seguro', 'Outros'
];

export const INITIAL_PLATFORMS = [
  'Amazon Flex', 'UberEats', 'PickGo', 'Rappi', 'Particular'
];

export const INITIAL_WAREHOUSES = [
  'DPR1 - Ibaraki', 'DPR2 - Saitama', 'DPR3 - Tokyo'
];

export const STORAGE_KEY = 'delivpro_data_v2';

export const DEFAULT_STATE: AppState = {
  currentUser: null,
  users: [ADMIN_MASTER],
  deliveries: [],
  expenses: [],
  vehicle: {
    id: '1',
    model: 'Veículo não configurado',
    plate: '---'
  },
  categories: INITIAL_CATEGORIES,
  platforms: INITIAL_PLATFORMS,
  warehouses: INITIAL_WAREHOUSES,
  isSyncEnabled: false,
  apiUrl: ''
};
