// This file allows switching between filesystem/memory storage and Supabase
// Automatically detects which to use based on environment variables

import type { User, Professional, VacationPeriod } from '@/types';

import * as databaseFileSystem from './db';
import * as databaseSupabase from './db-supabase';
import { uuidv7 } from './uuid-v7';
import { isStorageUnavailable } from './storage-errors';
import {
  DEMO_USER_ID,
  getDemoSnapshot,
  isDemoEmail,
  isDemoUserId,
} from './seed-demo';

function hasSupabaseEnvironment(): boolean {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const demoMode = process.env['DEMO_MODE'] === 'true';
  // DEMO_MODE=true forces demo/fallback storage even if Supabase is configured
  if (demoMode) return false;
  return url !== undefined && url !== '' && key !== undefined && key !== '';
}

async function withStorageFallback<T>(
  supabaseOp: () => Promise<T>,
  filesystemOp: () => Promise<T>,
  seedOp?: () => Promise<T>
): Promise<T> {
  if (hasSupabaseEnvironment()) {
    try {
      return await supabaseOp();
    } catch (error) {
      if (!isStorageUnavailable(error)) throw error;
      if (seedOp !== undefined) return seedOp();
      return filesystemOp();
    }
  }
  return filesystemOp();
}

export async function getUsers(): Promise<User[]> {
  return withStorageFallback(
    () => databaseSupabase.getUsers(),
    () => databaseFileSystem.getUsers()
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (isDemoEmail(normalized)) {
    return withStorageFallback(
      async () => {
        const user = await databaseSupabase.getUserByEmail(normalized);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => {
        const user = await databaseFileSystem.getUserByEmail(normalized);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => (await getDemoSnapshot()).user
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getUserByEmail(normalized),
    () => databaseFileSystem.getUserByEmail(normalized)
  );
}

export async function getUserById(id: string): Promise<User | null> {
  if (isDemoUserId(id)) {
    return withStorageFallback(
      async () => {
        const user = await databaseSupabase.getUserById(id);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => {
        const user = await databaseFileSystem.getUserById(id);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => (await getDemoSnapshot()).user
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getUserById(id),
    () => databaseFileSystem.getUserById(id)
  );
}

export async function getProfessionals(userId: string): Promise<Professional[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await databaseSupabase.getProfessionals(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).professionals;
      },
      async () => {
        const rows = await databaseFileSystem.getProfessionals(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).professionals;
      },
      async () => (await getDemoSnapshot()).professionals
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getProfessionals(userId),
    () => databaseFileSystem.getProfessionals(userId)
  );
}

export async function getProfessionalById(
  id: string,
  userId: string
): Promise<Professional | null> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const row = await databaseSupabase.getProfessionalById(id, userId);
        if (row !== null) return row;
        return (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null;
      },
      async () => {
        const row = await databaseFileSystem.getProfessionalById(id, userId);
        if (row !== null) return row;
        return (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null;
      },
      async () => (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getProfessionalById(id, userId),
    () => databaseFileSystem.getProfessionalById(id, userId)
  );
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Readonly<Partial<Professional>>
): Promise<Professional | null> {
  return withStorageFallback(
    () => databaseSupabase.updateProfessional(id, userId, updates),
    () => databaseFileSystem.updateProfessional(id, userId, updates)
  );
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  return withStorageFallback(
    () => databaseSupabase.deleteProfessional(id, userId),
    () => databaseFileSystem.deleteProfessional(id, userId)
  );
}

export async function deleteAllProfessionals(userId: string): Promise<void> {
  return withStorageFallback(
    () => databaseSupabase.deleteAllProfessionals(userId),
    () => databaseFileSystem.deleteAllProfessionals(userId)
  );
}

export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await databaseSupabase.getVacationPeriods(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).vacations;
      },
      async () => {
        const rows = await databaseFileSystem.getVacationPeriods(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).vacations;
      },
      async () => (await getDemoSnapshot()).vacations
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getVacationPeriods(userId),
    () => databaseFileSystem.getVacationPeriods(userId)
  );
}

export async function getVacationsByProfessional(
  professionalId: string,
  userId: string
): Promise<VacationPeriod[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await databaseSupabase.getVacationsByProfessional(professionalId, userId);
        if (rows.length > 0) return rows;
        return (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId);
      },
      async () => {
        const rows = await databaseFileSystem.getVacationsByProfessional(professionalId, userId);
        if (rows.length > 0) return rows;
        return (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId);
      },
      async () =>
        (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId)
    );
  }

  return withStorageFallback(
    () => databaseSupabase.getVacationsByProfessional(professionalId, userId),
    () => databaseFileSystem.getVacationsByProfessional(professionalId, userId)
  );
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Readonly<Partial<VacationPeriod>>
): Promise<VacationPeriod | null> {
  return withStorageFallback(
    () => databaseSupabase.updateVacationPeriod(id, userId, updates),
    () => databaseFileSystem.updateVacationPeriod(id, userId, updates)
  );
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  return withStorageFallback(
    () => databaseSupabase.deleteVacationPeriod(id, userId),
    () => databaseFileSystem.deleteVacationPeriod(id, userId)
  );
}

export async function deleteAllVacationPeriods(userId: string): Promise<void> {
  return withStorageFallback(
    () => databaseSupabase.deleteAllVacationPeriods(userId),
    () => databaseFileSystem.deleteAllVacationPeriods(userId)
  );
}

export async function createUser(input: Readonly<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  if (hasSupabaseEnvironment()) {
    try {
      return await databaseSupabase.createUser(input);
    } catch (error) {
      if (!isStorageUnavailable(error)) throw error;
    }
  }
  const user: User = {
    id: isDemoEmail(input.email) ? DEMO_USER_ID : uuidv7(),
    email: input.email,
    name: input.name,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  return databaseFileSystem.createUser(user);
}

export async function createProfessional(
  input: Readonly<Omit<Professional, 'id' | 'createdAt'>>
): Promise<Professional> {
  if (hasSupabaseEnvironment()) {
    try {
      return await databaseSupabase.createProfessional(input);
    } catch (error) {
      if (!isStorageUnavailable(error)) throw error;
    }
  }
  const professional: Professional = {
    id: uuidv7(),
    userId: input.userId,
    name: input.name,
    clientManager: input.clientManager,
    monthlyRevenue: input.monthlyRevenue,
    createdAt: new Date().toISOString(),
  };
  return databaseFileSystem.createProfessional(professional);
}

export async function createVacationPeriod(
  input: Readonly<Omit<VacationPeriod, 'id' | 'createdAt'>>
): Promise<VacationPeriod> {
  if (hasSupabaseEnvironment()) {
    try {
      return await databaseSupabase.createVacationPeriod(input);
    } catch (error) {
      if (!isStorageUnavailable(error)) throw error;
    }
  }
  const vacation: VacationPeriod = {
    id: uuidv7(),
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
  return databaseFileSystem.createVacationPeriod(vacation);
}