import { randomUUID } from 'crypto';

import {
  IProfessionalRepository,
  IUserRepository,
  IVacationRepository,
} from '@/interfaces/repositories';
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

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();
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

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = randomUUID();
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ id, ...user }])
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
}

export class SupabaseProfessionalRepository implements IProfessionalRepository {
  private get supabase() {
    return getSupabaseAdmin();
  }

  async getProfessionals(userId: string): Promise<Professional[]> {
    const { data, error } = await this.supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      name: p.name,
      clientManager: p.client_manager,
      monthlyRevenue:
        typeof p.monthly_revenue === 'string' ? parseFloat(p.monthly_revenue) : p.monthly_revenue,
      createdAt: p.created_at,
    }));
  }

  async getProfessionalById(id: string, userId: string): Promise<Professional | null> {
    const { data, error } = await this.supabase
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

  async deleteProfessional(id: string, userId: string): Promise<boolean> {
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

  async getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
    const { data, error } = await this.supabase
      .from('vacation_periods')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((v) => ({
      id: v.id,
      professionalId: v.professional_id,
      userId: v.user_id,
      acquisitionStartDate: v.acquisition_start_date,
      acquisitionEndDate: v.acquisition_end_date,
      usageStartDate: v.usage_start_date,
      usageEndDate: v.usage_end_date,
      totalDays: v.total_days,
      revenueDeduction:
        typeof v.revenue_deduction === 'string'
          ? parseFloat(v.revenue_deduction)
          : v.revenue_deduction,
      createdAt: v.created_at,
    }));
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
    return (data || []).map((v) => ({
      id: v.id,
      professionalId: v.professional_id,
      userId: v.user_id,
      acquisitionStartDate: v.acquisition_start_date,
      acquisitionEndDate: v.acquisition_end_date,
      usageStartDate: v.usage_start_date,
      usageEndDate: v.usage_end_date,
      totalDays: v.total_days,
      revenueDeduction:
        typeof v.revenue_deduction === 'string'
          ? parseFloat(v.revenue_deduction)
          : v.revenue_deduction,
      createdAt: v.created_at,
    }));
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
