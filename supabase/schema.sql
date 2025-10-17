-- Schema for sistema-ferias
-- Apply this in Supabase SQL Editor (Database > SQL) on your project

set check_function_bodies = off;
set search_path = public;

-- Ensure required extensions
create extension if not exists pgcrypto;

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password text not null,
  created_at timestamptz not null default now()
);

-- Professionals table
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  client_manager text not null,
  monthly_revenue numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists professionals_user_id_idx on public.professionals(user_id);

-- Vacation periods table
create table if not exists public.vacation_periods (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  acquisition_start_date date not null,
  acquisition_end_date date not null,
  usage_start_date date not null,
  usage_end_date date not null,
  total_days integer not null,
  revenue_deduction numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists vacation_periods_user_id_idx on public.vacation_periods(user_id);
create index if not exists vacation_periods_professional_id_idx on public.vacation_periods(professional_id);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.professionals enable row level security;
alter table public.vacation_periods enable row level security;

-- Policies for users
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
for select using (
  id = auth.uid() or (auth.jwt() ->> 'email') = email
);

drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
for insert with check (
  id = auth.uid()
);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
for update using (
  id = auth.uid()
);

-- Policies for professionals
drop policy if exists professionals_select_own on public.professionals;
create policy professionals_select_own on public.professionals
for select using (
  user_id = auth.uid()
);

drop policy if exists professionals_insert_own on public.professionals;
create policy professionals_insert_own on public.professionals
for insert with check (
  user_id = auth.uid()
);

drop policy if exists professionals_update_own on public.professionals;
create policy professionals_update_own on public.professionals
for update using (
  user_id = auth.uid()
);

drop policy if exists professionals_delete_own on public.professionals;
create policy professionals_delete_own on public.professionals
for delete using (
  user_id = auth.uid()
);

-- Policies for vacation_periods
drop policy if exists vacations_select_own on public.vacation_periods;
create policy vacations_select_own on public.vacation_periods
for select using (
  user_id = auth.uid()
);

drop policy if exists vacations_insert_own on public.vacation_periods;
create policy vacations_insert_own on public.vacation_periods
for insert with check (
  user_id = auth.uid()
);

drop policy if exists vacations_update_own on public.vacation_periods;
create policy vacations_update_own on public.vacation_periods
for update using (
  user_id = auth.uid()
);

drop policy if exists vacations_delete_own on public.vacation_periods;
create policy vacations_delete_own on public.vacation_periods
for delete using (
  user_id = auth.uid()
);

-- Done
