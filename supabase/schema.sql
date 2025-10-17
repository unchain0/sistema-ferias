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
-- This app performs all DB access from the Next.js server using the Service Role key.
-- To avoid unexpected 401s, disable RLS for these tables. If you prefer RLS, you can enable and add policies later.
alter table public.users disable row level security;
alter table public.professionals disable row level security;
alter table public.vacation_periods disable row level security;

-- Done
