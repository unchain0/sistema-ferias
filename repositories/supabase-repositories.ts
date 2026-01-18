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
  mapProfessionalToDb,
  mapUserRow,
  mapUserToDb,
  mapVacationRow,
  mapVacationRows,
  mapVacationToDb,
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

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = randomUUID();
    const { data, error } = await this.supabase
      .from('users')
      .insert([mapUserToDb({ id, ...user })])
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
    professional: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Professional> {
    const { data, error } = await this.supabase
      .from('professionals')
      .insert([mapProfessionalToDb(professional)])
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
    const { data, error } = await this.supabase
      .from('professionals')
      .update(mapProfessionalToDb(updates))
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

  async deleteAllProfessionals(userId: string): Promise<void> {
    const { error } = await this.supabase.from('professionals').delete().eq('user_id', userId);
    if (error) throw error;
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

  async getVacationPeriodById(id: string, userId: string): Promise<VacationPeriod | null> {
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapVacationRow(data) : null;
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
    vacation: Omit<VacationPeriod, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<VacationPeriod> {
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .insert([mapVacationToDb(vacation)])
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
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .update(mapVacationToDb(updates))
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

  async deleteAllVacationPeriods(userId: string): Promise<void> {
    const { error } = await this.supabase.from('vacation_periods').delete().eq('user_id', userId);
    if (error) throw error;
  }
}
