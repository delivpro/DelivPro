-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    temp_password_flag BOOLEAN DEFAULT FALSE,
    access_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    model TEXT NOT NULL,
    shaken_expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    km_start INTEGER NOT NULL,
    km_end INTEGER NOT NULL,
    total_km INTEGER GENERATED ALWAYS AS (km_end - km_start) STORED,
    amount INTEGER NOT NULL, -- Stored in Yen (no decimals)
    status TEXT CHECK (status IN ('started', 'completed')) DEFAULT 'started',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- Fuel, Maintenance, Parking, etc.
    amount INTEGER NOT NULL,
    current_km INTEGER, -- Odometer reading at time of expense
    liters NUMERIC(5,2), -- Only for fuel
    is_full_tank BOOLEAN DEFAULT FALSE, -- Only for fuel
    next_oil_change_km INTEGER, -- Only for maintenance (oil change)
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Vehicles policies
CREATE POLICY "Users can view own vehicles" ON public.vehicles
    FOR ALL USING (user_id = auth.uid());

-- Deliveries policies
CREATE POLICY "Users can view own deliveries" ON public.deliveries
    FOR ALL USING (user_id = auth.uid());

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR ALL USING (user_id = auth.uid());

-- Function to handle new user signup (Supabase Auth Hook trigger usually, but defined here for reference)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
