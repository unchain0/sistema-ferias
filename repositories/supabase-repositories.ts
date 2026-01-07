import { randomUUID } from 'crypto';

import {
  IProfessionalRepository,
  IUserRepository,
  IVacationRepository,
  PaginatedResult,
  PaginationOptions,
} from '@/interfaces/repositories';
import { PROFESSIONAL_COLUMN_MAP, VACATION_COLUMN_MAP } from '@/lib/constants';
import {
  mapProfessionalRow,
  mapProfessionalRows,
  mapUserRow,
  mapVacationRow,
  mapVacationRows,
} from '@/lib/db-mappers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Professional, User, VacationPeriod } from '@/types';

export class SupabaseUserRepository implements IUserRepository {
  private get supabase() {
    return getSupabaseAdmin();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapUserRow(data) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapUserRow(data) : null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = randomUUID();
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ id, ...user }])
      .select()
      .single();
    if (error) throw error;
    return mapUserRow(data);
  }
}

export class SupabaseProfessionalRepository implements IProfessionalRepository {
  private get supabase() {
    return getSupabaseAdmin();
  }

  /**
   * Get all professionals for a user (legacy method)
   * @deprecated Use getProfessionalsPaginated for better performance
   */
  async getProfessionals(userId: string): Promise<Professional[]> {
    const { data, error } = await this.supabase
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
  async getProfessionalsPaginated(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Professional>> {
    // First get total count
    const { count: totalCount, error: countError } = await this.supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // Build query with ordering
    let query = this.supabase.from('professionals').select('*').eq('user_id', userId);

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

  async getProfessionalById(id: string, userId: string): Promise<Professional | null> {
    const { data, error } = await this.supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapProfessionalRow(data) : null;
  }

  async createProfessional(
    professional: Omit<Professional, 'id' | 'createdAt'>,
  ): Promise<Professional> {
    const { data, error } = await this.supabase
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

  async updateProfessional(
    id: string,
    userId: string,
    updates: Partial<Professional>,
  ): Promise<Professional | null> {
    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.clientManager) updateData.client_manager = updates.clientManager;
    if (updates.monthlyRevenue !== undefined) updateData.monthly_revenue = updates.monthlyRevenue;

    const { data, error } = await this.supabase
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

  async deleteProfessional(id: string, userId: string): Promise<boolean> {
    // Note: Consider implementing cascade delete for associated vacation periods
    // or handle orphaned vacations in application logic
    const { error, count } = await this.supabase
      .from('professionals')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return (count || 0) > 0;
  }
}

export class SupabaseVacationRepository implements IVacationRepository {
  private get supabase() {
    return getSupabaseAdmin();
  }

  /**
   * Get all vacation periods for a user (legacy method)
   * @deprecated Use getVacationPeriodsPaginated for better performance
   */
  async getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return mapVacationRows(data || []);
  }

  /**
   * Get vacation periods with database-level pagination and ordering
   * More efficient for large datasets as sorting/pagination happens in the database
   */
  async getVacationPeriodsPaginated(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VacationPeriod>> {
    // First get total count
    const { count: totalCount, error: countError } = await this.supabase
      .from('vacation_periods')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // Build query with ordering
    let query = this.supabase.from('vacation_periods').select('*').eq('user_id', userId);

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

  async getVacationsByProfessional(
    professionalId: string,
    userId: string,
  ): Promise<VacationPeriod[]> {
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('user_id', userId);
    if (error) throw error;
    return mapVacationRows(data || []);
  }

  async createVacationPeriod(
    vacation: Omit<VacationPeriod, 'id' | 'createdAt'>,
  ): Promise<VacationPeriod> {
    const { data, error } = await this.supabase
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

  async updateVacationPeriod(
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

    const { data, error } = await this.supabase
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

  async deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('vacation_periods')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return (count || 0) > 0;
  }
}
