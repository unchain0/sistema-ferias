import { User, Professional, VacationPeriod } from '@/types';
import { supabase } from './supabase';

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw error;
  return (data || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    password: u.password,
    createdAt: u.created_at,
  }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data ? {
    id: data.id,
    email: data.email,
    name: data.name,
    password: data.password,
    createdAt: data.created_at,
  } : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? {
    id: data.id,
    email: data.email,
    name: data.name,
    password: data.password,
    createdAt: data.created_at,
  } : null;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      email: user.email,
      name: user.name,
      password: user.password,
    }])
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
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    clientManager: p.client_manager,
    monthlyRevenue: typeof p.monthly_revenue === 'string' ? parseFloat(p.monthly_revenue) : p.monthly_revenue,
    createdAt: p.created_at,
  }));
}

export async function getProfessionalById(id: string, userId: string): Promise<Professional | null> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clientManager: data.client_manager,
    monthlyRevenue: typeof data.monthly_revenue === 'string' ? parseFloat(data.monthly_revenue) : data.monthly_revenue,
    createdAt: data.created_at,
  } : null;
}

export async function createProfessional(professional: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional> {
  const { data, error } = await supabase
    .from('professionals')
    .insert([{
      user_id: professional.userId,
      name: professional.name,
      client_manager: professional.clientManager,
      monthly_revenue: professional.monthlyRevenue,
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Convert snake_case to camelCase
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clientManager: data.client_manager,
    monthlyRevenue: data.monthly_revenue,
    createdAt: data.created_at,
  };
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Partial<Professional>
): Promise<Professional | null> {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.clientManager) updateData.client_manager = updates.clientManager;
  if (updates.monthlyRevenue !== undefined) updateData.monthly_revenue = updates.monthlyRevenue;

  const { data, error } = await supabase
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
    monthlyRevenue: data.monthly_revenue,
    createdAt: data.created_at,
  };
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('professionals')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
  return (count || 0) > 0;
}

// Vacation Periods
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const { data, error } = await supabase
    .from('vacation_periods')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  
  return (data || []).map((v: any) => ({
    id: v.id,
    professionalId: v.professional_id,
    userId: v.user_id,
    acquisitionStartDate: v.acquisition_start_date,
    acquisitionEndDate: v.acquisition_end_date,
    usageStartDate: v.usage_start_date,
    usageEndDate: v.usage_end_date,
    totalDays: v.total_days,
    revenueDeduction: v.revenue_deduction,
    createdAt: v.created_at,
  }));
}

export async function getVacationsByProfessional(
  professionalId: string,
  userId: string
): Promise<VacationPeriod[]> {
  const { data, error } = await supabase
    .from('vacation_periods')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  return (data || []).map((v: any) => ({
    id: v.id,
    professionalId: v.professional_id,
    userId: v.user_id,
    acquisitionStartDate: v.acquisition_start_date,
    acquisitionEndDate: v.acquisition_end_date,
    usageStartDate: v.usage_start_date,
    usageEndDate: v.usage_end_date,
    totalDays: v.total_days,
    revenueDeduction: v.revenue_deduction,
    createdAt: v.created_at,
  }));
}

export async function createVacationPeriod(vacation: Omit<VacationPeriod, 'id' | 'createdAt'>): Promise<VacationPeriod> {
  const { data, error } = await supabase
    .from('vacation_periods')
    .insert([{
      professional_id: vacation.professionalId,
      user_id: vacation.userId,
      acquisition_start_date: vacation.acquisitionStartDate,
      acquisition_end_date: vacation.acquisitionEndDate,
      usage_start_date: vacation.usageStartDate,
      usage_end_date: vacation.usageEndDate,
      total_days: vacation.totalDays,
      revenue_deduction: vacation.revenueDeduction,
    }])
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
    revenueDeduction: data.revenue_deduction,
    createdAt: data.created_at,
  };
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Partial<VacationPeriod>
): Promise<VacationPeriod | null> {
  const updateData: any = {};
  if (updates.acquisitionStartDate) updateData.acquisition_start_date = updates.acquisitionStartDate;
  if (updates.acquisitionEndDate) updateData.acquisition_end_date = updates.acquisitionEndDate;
  if (updates.usageStartDate) updateData.usage_start_date = updates.usageStartDate;
  if (updates.usageEndDate) updateData.usage_end_date = updates.usageEndDate;
  if (updates.totalDays !== undefined) updateData.total_days = updates.totalDays;
  if (updates.revenueDeduction !== undefined) updateData.revenue_deduction = updates.revenueDeduction;

  const { data, error } = await supabase
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
    revenueDeduction: data.revenue_deduction,
    createdAt: data.created_at,
  };
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('vacation_periods')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
  return (count || 0) > 0;
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
