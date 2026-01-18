-- Seed demo data for local development

-- Demo User (email: demo@sistema-ferias.com, password: demo123)
INSERT INTO public.users (id, email, name, password) 
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'demo@sistema-ferias.com', 
    'Usuário Demonstração', 
    '$2a$10$7R6v7u1i6y.yJ.vE5gK2O.fXv/F5gK2O.fXv/F5gK2O.fXv/F5gK2'
) ON CONFLICT (email) DO NOTHING;

-- Demo Professionals
INSERT INTO public.professionals (id, user_id, name, client_manager, monthly_revenue) VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'João Silva', 'Maria Santos', 15000),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Ana Costa', 'Carlos Oliveira', 18000),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Pedro Almeida', 'Juliana Ferreira', 12000),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Carla Mendes', 'Roberto Lima', 20000),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Lucas Martins', 'Fernanda Souza', 16000);

-- Demo Vacation Periods
INSERT INTO public.vacation_periods (professional_id, user_id, acquisition_start_date, acquisition_end_date, usage_start_date, usage_end_date, total_days, revenue_deduction) VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '2024-01-01', '2024-12-31', '2025-02-01', '2025-02-15', 15, 7500.00),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '2024-01-01', '2024-12-31', '2025-03-10', '2025-03-24', 15, 9000.00),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '2024-01-01', '2024-12-31', '2025-05-05', '2025-05-14', 10, 4000.00),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', '2024-01-01', '2024-12-31', '2025-06-15', '2025-06-29', 15, 10000.00);
