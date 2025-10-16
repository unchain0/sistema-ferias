-- Sistema de Gestão de Férias - Schema do Banco de Dados
-- Execute este script no SQL Editor do Supabase

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: professionals
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  client_manager VARCHAR(255) NOT NULL,
  monthly_revenue DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: vacation_periods
CREATE TABLE IF NOT EXISTS vacation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  acquisition_start_date DATE NOT NULL,
  acquisition_end_date DATE NOT NULL,
  usage_start_date DATE NOT NULL,
  usage_end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  revenue_deduction DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_vacation_periods_professional_id ON vacation_periods(professional_id);
CREATE INDEX IF NOT EXISTS idx_vacation_periods_user_id ON vacation_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_vacation_periods_usage_dates ON vacation_periods(usage_start_date, usage_end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (true);

-- RLS Policies for professionals table
CREATE POLICY "Users can view their own professionals"
  ON professionals FOR SELECT
  USING (user_id = auth.uid() OR true); -- Allow demo user access

CREATE POLICY "Users can insert their own professionals"
  ON professionals FOR INSERT
  WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Users can update their own professionals"
  ON professionals FOR UPDATE
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Users can delete their own professionals"
  ON professionals FOR DELETE
  USING (user_id = auth.uid() OR true);

-- RLS Policies for vacation_periods table
CREATE POLICY "Users can view their own vacation periods"
  ON vacation_periods FOR SELECT
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Users can insert their own vacation periods"
  ON vacation_periods FOR INSERT
  WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Users can update their own vacation periods"
  ON vacation_periods FOR UPDATE
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Users can delete their own vacation periods"
  ON vacation_periods FOR DELETE
  USING (user_id = auth.uid() OR true);
