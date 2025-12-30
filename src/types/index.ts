export type User = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    temp_password_flag: boolean;
    access_expiry?: string;
    created_at: string;
};

export type Vehicle = {
    id: string;
    user_id: string;
    plate: string;
    model: string;
    shaken_expiry_date: string;
    created_at: string;
};

export type Delivery = {
    id: string;
    user_id: string;
    date: string;
    km_start: number;
    km_end: number;
    total_km: number;
    amount: number;
    status: 'started' | 'completed';
    created_at: string;
};

export type Expense = {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    current_km?: number;
    liters?: number;
    is_full_tank?: boolean;
    next_oil_change_km?: number;
    description?: string;
    date: string;
    created_at: string;
};
