// This file allows switching between filesystem/memory storage and Supabase
// Automatically detects which to use based on environment variables

import { randomUUID } from 'crypto';
import { User, Professional, VacationPeriod } from '@/types';

const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Import from the appropriate module
import * as dbFileSystem from './db';
import * as dbSupabase from './db-supabase';

export const getUsers = USE_SUPABASE ? dbSupabase.getUsers : dbFileSystem.getUsers;
export const getUserByEmail = USE_SUPABASE ? dbSupabase.getUserByEmail : dbFileSystem.getUserByEmail;
export const getUserById = USE_SUPABASE ? dbSupabase.getUserById : dbFileSystem.getUserById;

export const getProfessionals = USE_SUPABASE ? dbSupabase.getProfessionals : dbFileSystem.getProfessionals;
export const getProfessionalById = USE_SUPABASE ? dbSupabase.getProfessionalById : dbFileSystem.getProfessionalById;
export const updateProfessional = USE_SUPABASE ? dbSupabase.updateProfessional : dbFileSystem.updateProfessional;
export const deleteProfessional = USE_SUPABASE ? dbSupabase.deleteProfessional : dbFileSystem.deleteProfessional;

export const getVacationPeriods = USE_SUPABASE ? dbSupabase.getVacationPeriods : dbFileSystem.getVacationPeriods;
export const getVacationsByProfessional = USE_SUPABASE ? dbSupabase.getVacationsByProfessional : dbFileSystem.getVacationsByProfessional;
export const updateVacationPeriod = USE_SUPABASE ? dbSupabase.updateVacationPeriod : dbFileSystem.updateVacationPeriod;
export const deleteVacationPeriod = USE_SUPABASE ? dbSupabase.deleteVacationPeriod : dbFileSystem.deleteVacationPeriod;

export async function createUser(input: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  if (USE_SUPABASE) {
    return dbSupabase.createUser(input);
  }
  const user: User = {
    id: randomUUID(),
    email: input.email,
    name: input.name,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  return dbFileSystem.createUser(user);
}

export async function createProfessional(input: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional> {
  if (USE_SUPABASE) {
    return dbSupabase.createProfessional(input);
  }
  const professional: Professional = {
    id: randomUUID(),
    userId: input.userId,
    name: input.name,
    clientManager: input.clientManager,
    monthlyRevenue: input.monthlyRevenue,
    createdAt: new Date().toISOString(),
  };
  return dbFileSystem.createProfessional(professional);
}

export async function createVacationPeriod(input: Omit<VacationPeriod, 'id' | 'createdAt'>): Promise<VacationPeriod> {
  if (USE_SUPABASE) {
    return dbSupabase.createVacationPeriod(input);
  }
  const vacation: VacationPeriod = {
    id: randomUUID(),
    professionalId: input.professionalId,
    userId: input.userId,
    acquisitionStartDate: input.acquisitionStartDate,
    acquisitionEndDate: input.acquisitionEndDate,
    usageStartDate: input.usageStartDate,
    usageEndDate: input.usageEndDate,
    totalDays: input.totalDays,
    revenueDeduction: input.revenueDeduction,
    createdAt: new Date().toISOString(),
  };
  return dbFileSystem.createVacationPeriod(vacation);
}
