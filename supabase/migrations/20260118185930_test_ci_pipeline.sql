-- Migration test for CI/CD pipeline
create table if not exists public.ci_test (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  test_name text not null
);

-- Basic RLS for the test table
alter table public.ci_test enable row level security;
create policy "Anyone can select" on public.ci_test for select using (true);
