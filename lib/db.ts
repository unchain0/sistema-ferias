import { randomUUID } from 'crypto';

import { PaginatedResult, PaginationOptions } from '@/interfaces/repositories';
import { PROFESSIONAL_COLUMN_MAP, VACATION_COLUMN_MAP } from '@/lib/constants';
import {
  mapProfessionalRow,
  mapProfessionalRows,
  mapUserRow,
  mapUserRows,
  mapVacationRow,
  mapVacationRows,
} from '@/lib/db-mappers';
import { Professional, User, VacationPeriod } from '@/types';

import { getSupabaseAdmin } from './supabase-admin';

const supabaseAdmin = getSupabaseAdmin();

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin.from('users').select('*');

  if (error) throw error;
  return mapUserRows(data || []);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapUserRow(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapUserRow(data) : null;
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
  return mapUserRow(data);
}

// Professionals
/**
 * Get all professionals for a user (legacy method)
 * @deprecated Use getProfessionalsPaginated for better performance
 */
export async function getProfessionals(userId: string): Promise<Professional[]> {
  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return mapProfessionalRows(data || []);
}

/**
 * Get professionals with database-level pagination and ordering
 * More efficient for large datasets as sorting/pagination happens in the database
 */
export async function getProfessionalsPaginated(
  userId: string,
  options?: PaginationOptions,
): Promise<PaginatedResult<Professional>> {
  // First get total count
  const { count: totalCount, error: countError } = await supabaseAdmin
    .from('professionals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) throw countError;

  // Build query with ordering
  let query = supabaseAdmin.from('professionals').select('*').eq('user_id', userId);

  // Apply ordering at database level
  if (options?.orderBy) {
    const dbColumn = PROFESSIONAL_COLUMN_MAP[options.orderBy] || 'created_at';
    query = query.order(dbColumn, { ascending: options.orderDir === 'asc' });
    // Add secondary sort by id for deterministic ordering
    if (dbColumn !== 'id') {
      query = query.order('id', { ascending: options.orderDir === 'asc' });
    }
  } else {
    // Default ordering
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  // Apply pagination at database level
  if (options?.limit !== undefined && options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    data: mapProfessionalRows(data || []),
    total: totalCount || 0,
  };
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
  return data ? mapProfessionalRow(data) : null;
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
  return mapProfessionalRow(data);
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

  return mapProfessionalRow(data);
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  // Note: Consider implementing cascade delete for associated vacation periods
  // or handle orphaned vacations in application logic
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

/**
 * Get all vacation periods for a user (legacy method)
 * @deprecated Use getVacationPeriodsPaginated for better performance
 */
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const { data, error } = await supabaseAdmin
    .from('vacation_periods')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return mapVacationRows(data || []);
}

/**
 * Get vacation periods with database-level pagination and ordering
 * More efficient for large datasets
 */
export async function getVacationPeriodsPaginated(
  userId: string,
  options?: PaginationOptions,
): Promise<PaginatedResult<VacationPeriod>> {
  // First get total count
  const { count: totalCount, error: countError } = await supabaseAdmin
    .from('vacation_periods')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) throw countError;

  // Build query with ordering
  let query = supabaseAdmin.from('vacation_periods').select('*').eq('user_id', userId);

  // Apply ordering at database level
  if (options?.orderBy) {
    const dbColumn = VACATION_COLUMN_MAP[options.orderBy] || 'created_at';
    query = query.order(dbColumn, { ascending: options.orderDir === 'asc' });
    // Add secondary sort by id for deterministic ordering
    if (dbColumn !== 'id') {
      query = query.order('id', { ascending: options.orderDir === 'asc' });
    }
  } else {
    // Default ordering
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  // Apply pagination at database level
  if (options?.limit !== undefined && options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    data: mapVacationRows(data || []),
    total: totalCount || 0,
  };
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

  return mapVacationRows(data || []);
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
  return mapVacationRow(data);
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

  return mapVacationRow(data);
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

export async function deleteVacationsByProfessional(
  professionalId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('vacation_periods')
    .delete()
    .eq('professional_id', professionalId)
    .eq('user_id', userId);

  if (error) throw error;
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
