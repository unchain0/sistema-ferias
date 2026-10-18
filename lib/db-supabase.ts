import type { User, Professional, VacationPeriod } from '@/types';

import { supabase } from './supabase';
import { createSupabaseForClaims } from './supabase-server';
import { uuidv7 } from './uuid-v7';
import type { SupabaseClient } from '@supabase/supabase-js';

function getSupabaseClient(): SupabaseClient {
  if (supabase === undefined) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }
  return supabase;
}

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password: string;
  created_at: string;
  [key: string]: unknown;
}

interface DatabaseProfessional {
  id: string;
  user_id: string;
  name: string;
  client_manager: string | null;
  monthly_revenue: number | string;
  created_at: string;
  [key: string]: unknown;
}

interface DatabaseVacationPeriod {
  id: string;
  professional_id: string;
  user_id: string;
  acquisition_start_date: string;
  acquisition_end_date: string;
  usage_start_date: string;
  usage_end_date: string;
  total_days: number;
  revenue_deduction: number | string;
  created_at: string;
  [key: string]: unknown;
}

function mapDatabaseUser(data: DatabaseUser): User {
  return {
    id: data.id ?? '',
    email: data.email ?? '',
    name: data.name ?? '',
    password: data.password ?? '',
    createdAt: data.created_at ?? '',
  };
}

function mapDatabaseProfessional(data: DatabaseProfessional): Professional {
  const monthlyRevenue = data['monthly_revenue'];
  return {
    id: data.id ?? '',
    userId: data.user_id ?? '',
    name: (data['name'] as string) ?? '',
    clientManager: (data['client_manager'] as string | null) ?? '',
    monthlyRevenue: typeof monthlyRevenue === 'string' ? Number.parseFloat(monthlyRevenue) : (monthlyRevenue as number) ?? 0,
    createdAt: (data.created_at as string) ?? '',
  };
}

function mapDatabaseVacationPeriod(data: DatabaseVacationPeriod): VacationPeriod {
  const revenueDeduction = data['revenue_deduction'];
  return {
    id: data.id ?? '',
    professionalId: data.professional_id ?? '',
    userId: data.user_id ?? '',
    acquisitionStartDate: (data['acquisition_start_date'] as string) ?? '',
    acquisitionEndDate: (data['acquisition_end_date'] as string) ?? '',
    usageStartDate: (data['usage_start_date'] as string) ?? '',
    usageEndDate: (data['usage_end_date'] as string) ?? '',
    totalDays: (data['total_days'] as number) ?? 0,
    revenueDeduction: typeof revenueDeduction === 'string' ? Number.parseFloat(revenueDeduction) : (revenueDeduction as number) ?? 0,
    createdAt: (data.created_at as string) ?? '',
  };
}

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('*');

  if (error) throw error;
  return (data as DatabaseUser[] ?? []).map(mapDatabaseUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const s = createSupabaseForClaims({ email });
  const { data, error } = await s
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data !== null ? mapDatabaseUser(data as DatabaseUser) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const s = createSupabaseForClaims({ sub: id });
  const { data, error } = await s
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data !== null ? mapDatabaseUser(data as DatabaseUser) : null;
}

export async function createUser(user: Readonly<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const id = uuidv7();
  const s = createSupabaseForClaims({ sub: id });
  const { data, error } = await s
    .from('users')
    .insert([{
      id,
      email: user.email,
      name: user.name,
      password: user.password,
    }])
    .select()
    .single();
  if (error) throw error;
  return mapDatabaseUser(data as DatabaseUser);
}

// Professionals
export async function getProfessionals(userId: string): Promise<Professional[]> {
  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
    .from('professionals')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as DatabaseProfessional[] ?? []).map(mapDatabaseProfessional);
}

export async function getProfessionalById(id: string, userId: string): Promise<Professional | null> {
  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
    .from('professionals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data !== null ? mapDatabaseProfessional(data as DatabaseProfessional) : null;
}

export async function createProfessional(professional: Readonly<Omit<Professional, 'id' | 'createdAt'>>): Promise<Professional> {
  const s = createSupabaseForClaims({ sub: professional.userId });
  const { data, error } = await s
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
  return mapDatabaseProfessional(data as DatabaseProfessional);
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Readonly<Partial<Professional>>
): Promise<Professional | null> {
  const updateData: Record<string, unknown> = {};
  if (updates['name'] !== undefined) updateData['name'] = updates['name'];
  if (updates['clientManager'] !== undefined) updateData['client_manager'] = updates['clientManager'];
  if (updates['monthlyRevenue'] !== undefined) updateData['monthly_revenue'] = updates['monthlyRevenue'];

  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
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

  return mapDatabaseProfessional(data as DatabaseProfessional);
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  const s = createSupabaseForClaims({ sub: userId });
  const { error, count } = await s
    .from('professionals')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function deleteAllProfessionals(userId: string): Promise<void> {
  const s = createSupabaseForClaims({ sub: userId });
  const { error } = await s
    .from('professionals')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// Vacation Periods
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
    .from('vacation_periods')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as DatabaseVacationPeriod[] ?? []).map(mapDatabaseVacationPeriod);
}

export async function getVacationsByProfessional(
  professionalId: string,
  userId: string
): Promise<VacationPeriod[]> {
  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
    .from('vacation_periods')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('user_id', userId);

  if (error) throw error;

  return (data as DatabaseVacationPeriod[] ?? []).map(mapDatabaseVacationPeriod);
}

export async function createVacationPeriod(
  vacation: Readonly<Omit<VacationPeriod, 'id' | 'createdAt'>>
): Promise<VacationPeriod> {
  const s = createSupabaseForClaims({ sub: vacation.userId });
  const { data, error } = await s
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
  return mapDatabaseVacationPeriod(data as DatabaseVacationPeriod);
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Readonly<Partial<VacationPeriod>>
): Promise<VacationPeriod | null> {
  const updateData: Record<string, unknown> = {};
  if (updates['acquisitionStartDate'] !== undefined) updateData['acquisition_start_date'] = updates['acquisitionStartDate'];
  if (updates['acquisitionEndDate'] !== undefined) updateData['acquisition_end_date'] = updates['acquisitionEndDate'];
  if (updates['usageStartDate'] !== undefined) updateData['usage_start_date'] = updates['usageStartDate'];
  if (updates['usageEndDate'] !== undefined) updateData['usage_end_date'] = updates['usageEndDate'];
  if (updates['totalDays'] !== undefined) updateData['total_days'] = updates['totalDays'];
  if (updates['revenueDeduction'] !== undefined) updateData['revenue_deduction'] = updates['revenueDeduction'];

  const s = createSupabaseForClaims({ sub: userId });
  const { data, error } = await s
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

  return mapDatabaseVacationPeriod(data as DatabaseVacationPeriod);
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  const s = createSupabaseForClaims({ sub: userId });
  const { error, count } = await s
    .from('vacation_periods')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function deleteAllVacationPeriods(userId: string): Promise<void> {
  const s = createSupabaseForClaims({ sub: userId });
  const { error } = await s
    .from('vacation_periods')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// Initialize demo data in Supabase
export async function initializeSupabaseDemo(demoData: Readonly<{
  user: Omit<User, 'id' | 'createdAt'>;
  professionals: ReadonlyArray<Omit<Professional, 'id' | 'createdAt'>>;
  vacations: ReadonlyArray<Omit<VacationPeriod, 'id' | 'createdAt'>>;
}>): Promise<User> {
  // Check if demo user already exists
  const existingUser = await getUserByEmail(demoData.user.email);

  if (existingUser !== null) {
    return existingUser;
  }

  // Create demo user
  const user = await createUser(demoData.user);

  // Create professionals
  for (const prof of demoData.professionals) {
    // eslint-disable-next-line no-await-in-loop -- sequential creation required for referential integrity
    await createProfessional({ ...prof, userId: user.id });
  }

  // Create vacations
  for (const vac of demoData.vacations) {
    // eslint-disable-next-line no-await-in-loop -- sequential creation required for referential integrity
    await createVacationPeriod({ ...vac, userId: user.id });
  }

  return user;
}