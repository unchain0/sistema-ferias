import { randomUUID } from 'crypto';

import { Professional, User, VacationPeriod } from '@/types';

import { getSupabaseAdmin } from './supabase-admin';

const supabaseAdmin = getSupabaseAdmin();

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin.from('users').select('*');

  if (error) throw error;
  return (data || []).map((u: Record<string, unknown>) => ({
    id: u.id as string,
    email: u.email as string,
    name: u.name as string,
    password: u.password as string,
    createdAt: u.created_at as string,
  }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data
    ? {
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password,
        createdAt: data.created_at,
      }
    : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data
    ? {
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password,
        createdAt: data.created_at,
      }
    : null;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const id = randomUUID();
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        id,
        email: user.email,
        name: user.name,
        password: user.password,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    password: data.password,
    createdAt: data.created_at,
  };
}

// Professionals
export async function getProfessionals(userId: string): Promise<Professional[]> {
  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    userId: p.user_id as string,
    name: p.name as string,
    clientManager: p.client_manager as string,
    monthlyRevenue:
      typeof p.monthly_revenue === 'string'
        ? parseFloat(p.monthly_revenue)
        : (p.monthly_revenue as number),
    createdAt: p.created_at as string,
  }));
}

export async function getProfessionalById(
  id: string,
  userId: string,
): Promise<Professional | null> {
  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data
    ? {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        clientManager: data.client_manager,
        monthlyRevenue:
          typeof data.monthly_revenue === 'string'
            ? parseFloat(data.monthly_revenue)
            : data.monthly_revenue,
        createdAt: data.created_at,
      }
    : null;
}

export async function createProfessional(
  professional: Omit<Professional, 'id' | 'createdAt'>,
): Promise<Professional> {
  const { data, error } = await supabaseAdmin
    .from('professionals')
    .insert([
      {
        user_id: professional.userId,
        name: professional.name,
        client_manager: professional.clientManager,
        monthly_revenue: professional.monthlyRevenue,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clientManager: data.client_manager,
    monthlyRevenue:
      typeof data.monthly_revenue === 'string'
        ? parseFloat(data.monthly_revenue)
        : data.monthly_revenue,
    createdAt: data.created_at,
  };
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Partial<Professional>,
): Promise<Professional | null> {
  const updateData: Record<string, unknown> = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.clientManager) updateData.client_manager = updates.clientManager;
  if (updates.monthlyRevenue !== undefined) updateData.monthly_revenue = updates.monthlyRevenue;

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clientManager: data.client_manager,
    monthlyRevenue:
      typeof data.monthly_revenue === 'string'
        ? parseFloat(data.monthly_revenue)
        : data.monthly_revenue,
    createdAt: data.created_at,
  };
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('professionals')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return (count || 0) > 0;
}

export async function deleteAllProfessionals(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('professionals').delete().eq('user_id', userId);
  if (error) throw error;
}

// Vacation Periods
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const { data, error } = await supabaseAdmin
    .from('vacation_periods')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    professionalId: v.professional_id as string,
    userId: v.user_id as string,
    acquisitionStartDate: v.acquisition_start_date as string,
    acquisitionEndDate: v.acquisition_end_date as string,
    usageStartDate: v.usage_start_date as string,
    usageEndDate: v.usage_end_date as string,
    totalDays: v.total_days as number,
    revenueDeduction:
      typeof v.revenue_deduction === 'string'
        ? parseFloat(v.revenue_deduction)
        : (v.revenue_deduction as number),
    createdAt: v.created_at as string,
  }));
}

export async function getVacationsByProfessional(
  professionalId: string,
  userId: string,
): Promise<VacationPeriod[]> {
  const { data, error } = await supabaseAdmin
    .from('vacation_periods')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    professionalId: v.professional_id as string,
    userId: v.user_id as string,
    acquisitionStartDate: v.acquisition_start_date as string,
    acquisitionEndDate: v.acquisition_end_date as string,
    usageStartDate: v.usage_start_date as string,
    usageEndDate: v.usage_end_date as string,
    totalDays: v.total_days as number,
    revenueDeduction:
      typeof v.revenue_deduction === 'string'
        ? parseFloat(v.revenue_deduction)
        : (v.revenue_deduction as number),
    createdAt: v.created_at as string,
  }));
}

export async function createVacationPeriod(
  vacation: Omit<VacationPeriod, 'id' | 'createdAt'>,
): Promise<VacationPeriod> {
  const { data, error } = await supabaseAdmin
    .from('vacation_periods')
    .insert([
      {
        professional_id: vacation.professionalId,
        user_id: vacation.userId,
        acquisition_start_date: vacation.acquisitionStartDate,
        acquisition_end_date: vacation.acquisitionEndDate,
        usage_start_date: vacation.usageStartDate,
        usage_end_date: vacation.usageEndDate,
        total_days: vacation.totalDays,
        revenue_deduction: vacation.revenueDeduction,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    professionalId: data.professional_id,
    userId: data.user_id,
    acquisitionStartDate: data.acquisition_start_date,
    acquisitionEndDate: data.acquisition_end_date,
    usageStartDate: data.usage_start_date,
    usageEndDate: data.usage_end_date,
    totalDays: data.total_days,
    revenueDeduction:
      typeof data.revenue_deduction === 'string'
        ? parseFloat(data.revenue_deduction)
        : data.revenue_deduction,
    createdAt: data.created_at,
  };
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Partial<VacationPeriod>,
): Promise<VacationPeriod | null> {
  const updateData: Record<string, unknown> = {};
  if (updates.acquisitionStartDate)
    updateData.acquisition_start_date = updates.acquisitionStartDate;
  if (updates.acquisitionEndDate) updateData.acquisition_end_date = updates.acquisitionEndDate;
  if (updates.usageStartDate) updateData.usage_start_date = updates.usageStartDate;
  if (updates.usageEndDate) updateData.usage_end_date = updates.usageEndDate;
  if (updates.totalDays !== undefined) updateData.total_days = updates.totalDays;
  if (updates.revenueDeduction !== undefined)
    updateData.revenue_deduction = updates.revenueDeduction;

  const { data, error } = await supabaseAdmin
    .from('vacation_periods')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    professionalId: data.professional_id,
    userId: data.user_id,
    acquisitionStartDate: data.acquisition_start_date,
    acquisitionEndDate: data.acquisition_end_date,
    usageStartDate: data.usage_start_date,
    usageEndDate: data.usage_end_date,
    totalDays: data.total_days,
    revenueDeduction:
      typeof data.revenue_deduction === 'string'
        ? parseFloat(data.revenue_deduction)
        : data.revenue_deduction,
    createdAt: data.created_at,
  };
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('vacation_periods')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return (count || 0) > 0;
}

export async function deleteAllVacationPeriods(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('vacation_periods').delete().eq('user_id', userId);
  if (error) throw error;
}

// Initialize demo data in Supabase
export async function initializeSupabaseDemo(demoData: {
  user: Omit<User, 'id' | 'createdAt'>;
  professionals: Omit<Professional, 'id' | 'createdAt'>[];
  vacations: Omit<VacationPeriod, 'id' | 'createdAt'>[];
}) {
  // Check if demo user already exists
  const existingUser = await getUserByEmail(demoData.user.email);

  if (existingUser) {
    return existingUser;
  }

  // Create demo user
  const user = await createUser(demoData.user);

  // Create professionals
  for (const prof of demoData.professionals) {
    await createProfessional({ ...prof, userId: user.id });
  }

  // Create vacations
  for (const vac of demoData.vacations) {
    await createVacationPeriod({ ...vac, userId: user.id });
  }

  return user;
}
