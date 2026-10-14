// This file allows switching between filesystem/memory storage and Supabase
// Automatically detects which to use based on environment variables

import { User, Professional, VacationPeriod } from '@/types';
import { uuidv7 } from './uuid-v7';
import { isStorageUnavailable } from './storage-errors';
import {
  DEMO_USER_ID,
  getDemoSnapshot,
  isDemoEmail,
  isDemoUserId,
} from './seed-demo';

function hasSupabaseEnv(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

import * as dbFileSystem from './db';
import * as dbSupabase from './db-supabase';

async function withStorageFallback<T>(
  supabaseOp: () => Promise<T>,
  filesystemOp: () => Promise<T>,
  seedOp?: () => Promise<T>
): Promise<T> {
  if (hasSupabaseEnv()) {
    try {
      return await supabaseOp();
    } catch (error) {
      if (!isStorageUnavailable(error)) throw error;
      if (seedOp) return seedOp();
      return filesystemOp();
    }
  }
  return filesystemOp();
}

export async function getUsers(): Promise<User[]> {
  return withStorageFallback(
    () => dbSupabase.getUsers(),
    () => dbFileSystem.getUsers()
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (isDemoEmail(normalized)) {
    return withStorageFallback(
      async () => {
        const user = await dbSupabase.getUserByEmail(normalized);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => {
        const user = await dbFileSystem.getUserByEmail(normalized);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => (await getDemoSnapshot()).user
    );
  }

  return withStorageFallback(
    () => dbSupabase.getUserByEmail(normalized),
    () => dbFileSystem.getUserByEmail(normalized)
  );
}

export async function getUserById(id: string): Promise<User | null> {
  if (isDemoUserId(id)) {
    return withStorageFallback(
      async () => {
        const user = await dbSupabase.getUserById(id);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => {
        const user = await dbFileSystem.getUserById(id);
        return user ?? (await getDemoSnapshot()).user;
      },
      async () => (await getDemoSnapshot()).user
    );
  }

  return withStorageFallback(
    () => dbSupabase.getUserById(id),
    () => dbFileSystem.getUserById(id)
  );
}

export async function getProfessionals(userId: string): Promise<Professional[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await dbSupabase.getProfessionals(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).professionals;
      },
      async () => {
        const rows = await dbFileSystem.getProfessionals(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).professionals;
      },
      async () => (await getDemoSnapshot()).professionals
    );
  }

  return withStorageFallback(
    () => dbSupabase.getProfessionals(userId),
    () => dbFileSystem.getProfessionals(userId)
  );
}

export async function getProfessionalById(id: string, userId: string): Promise<Professional | null> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const row = await dbSupabase.getProfessionalById(id, userId);
        if (row) return row;
        return (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null;
      },
      async () => {
        const row = await dbFileSystem.getProfessionalById(id, userId);
        if (row) return row;
        return (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null;
      },
      async () => (await getDemoSnapshot()).professionals.find((p) => p.id === id) ?? null
    );
  }

  return withStorageFallback(
    () => dbSupabase.getProfessionalById(id, userId),
    () => dbFileSystem.getProfessionalById(id, userId)
  );
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Partial<Professional>
): Promise<Professional | null> {
  return withStorageFallback(
    () => dbSupabase.updateProfessional(id, userId, updates),
    () => dbFileSystem.updateProfessional(id, userId, updates)
  );
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  return withStorageFallback(
    () => dbSupabase.deleteProfessional(id, userId),
    () => dbFileSystem.deleteProfessional(id, userId)
  );
}

export async function deleteAllProfessionals(userId: string): Promise<void> {
  return withStorageFallback(
    () => dbSupabase.deleteAllProfessionals(userId),
    () => dbFileSystem.deleteAllProfessionals(userId)
  );
}

export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await dbSupabase.getVacationPeriods(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).vacations;
      },
      async () => {
        const rows = await dbFileSystem.getVacationPeriods(userId);
        return rows.length > 0 ? rows : (await getDemoSnapshot()).vacations;
      },
      async () => (await getDemoSnapshot()).vacations
    );
  }

  return withStorageFallback(
    () => dbSupabase.getVacationPeriods(userId),
    () => dbFileSystem.getVacationPeriods(userId)
  );
}

export async function getVacationsByProfessional(
  professionalId: string,
  userId: string
): Promise<VacationPeriod[]> {
  if (isDemoUserId(userId)) {
    return withStorageFallback(
      async () => {
        const rows = await dbSupabase.getVacationsByProfessional(professionalId, userId);
        if (rows.length > 0) return rows;
        return (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId);
      },
      async () => {
        const rows = await dbFileSystem.getVacationsByProfessional(professionalId, userId);
        if (rows.length > 0) return rows;
        return (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId);
      },
      async () =>
        (await getDemoSnapshot()).vacations.filter((v) => v.professionalId === professionalId)
    );
  }

  return withStorageFallback(
    () => dbSupabase.getVacationsByProfessional(professionalId, userId),
    () => dbFileSystem.getVacationsByProfessional(professionalId, userId)
  );
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Partial<VacationPeriod>
): Promise<VacationPeriod | null> {
  return withStorageFallback(
    () => dbSupabase.updateVacationPeriod(id, userId, updates),
    () => dbFileSystem.updateVacationPeriod(id, userId, updates)
  );
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  return withStorageFallback(
    () => dbSupabase.deleteVacationPeriod(id, userId),
    () => dbFileSystem.deleteVacationPeriod(id, userId)
  );
}

export async function deleteAllVacationPeriods(userId: string): Promise<void> {
  return withStorageFallback(
    () => dbSupabase.deleteAllVacationPeriods(userId),
    () => dbFileSystem.deleteAllVacationPeriods(userId)
  );
}

export async function createUser(input: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  if (hasSupabaseEnv()) {
    try {
      return await dbSupabase.createUser(input);
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
  return dbFileSystem.createUser(user);
}

export async function createProfessional(
  input: Omit<Professional, 'id' | 'createdAt'>
): Promise<Professional> {
  if (hasSupabaseEnv()) {
    try {
      return await dbSupabase.createProfessional(input);
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
  return dbFileSystem.createProfessional(professional);
}

export async function createVacationPeriod(
  input: Omit<VacationPeriod, 'id' | 'createdAt'>
): Promise<VacationPeriod> {
  if (hasSupabaseEnv()) {
    try {
      return await dbSupabase.createVacationPeriod(input);
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
  return dbFileSystem.createVacationPeriod(vacation);
}
