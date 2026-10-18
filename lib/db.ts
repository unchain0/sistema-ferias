// eslint-disable-next-line unicorn/prevent-abbreviations -- well-known abbreviation "db" for database
import fs from 'node:fs/promises';
import path from 'node:path';

import type { User, Professional, VacationPeriod } from '@/types';

// Detect if running in serverless environment (Vercel)
const IS_SERVERLESS = process.env.VERCEL === '1' || (process.env.NODE_ENV === 'production' && process.env['USE_FILESYSTEM'] !== '1');

// In-memory storage for serverless environments
const memoryStorage = {
  users: [] as User[],
  professionals: [] as Professional[],
  vacations: [] as VacationPeriod[],
};

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFESSIONALS_FILE = path.join(DATA_DIR, 'professionals.json');
const VACATIONS_FILE = path.join(DATA_DIR, 'vacations.json');

async function ensureDataDirectory(): Promise<void> {
  if (IS_SERVERLESS) return; // Skip filesystem operations in serverless
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  if (IS_SERVERLESS) {
    return [];
  }
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile<T>(filePath: string, data: ReadonlyArray<T>): Promise<void> {
  if (IS_SERVERLESS) {
    return;
  }
  await ensureDataDirectory();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Users
export async function getUsers(): Promise<User[]> {
  return readJsonFile<User>(USERS_FILE);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email === email) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(user: Readonly<User>): Promise<User> {
  const users = await getUsers();
  users.push(user);
  await writeJsonFile(USERS_FILE, users);
  return user;
}

// Professionals
export async function getProfessionals(userId: string): Promise<Professional[]> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  return professionals.filter((p) => p.userId === userId);
}

export async function getProfessionalById(id: string, userId: string): Promise<Professional | null> {
  const professionals = await getProfessionals(userId);
  return professionals.find((p) => p.id === id) ?? null;
}

export async function createProfessional(professional: Readonly<Professional>): Promise<Professional> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  professionals.push(professional);
  await writeJsonFile(PROFESSIONALS_FILE, professionals);
  return professional;
}

export async function updateProfessional(
  id: string,
  userId: string,
  updates: Readonly<Partial<Professional>>
): Promise<Professional | null> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  const index = professionals.findIndex((p) => p.id === id && p.userId === userId);

  if (index === -1) return null;

  const updated = { ...professionals[index], ...updates } as Professional;
  professionals[index] = updated;
  await writeJsonFile(PROFESSIONALS_FILE, professionals);
  return updated;
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  const filtered = professionals.filter((p) => !(p.id === id && p.userId === userId));

  if (filtered.length === professionals.length) return false;

  await writeJsonFile(PROFESSIONALS_FILE, filtered);
  return true;
}

export async function deleteAllProfessionals(userId: string): Promise<void> {
  const professionals = await getProfessionals(userId);
  for (const p of professionals) {
    // eslint-disable-next-line no-await-in-loop -- sequential deletion required for data consistency
    await deleteProfessional(p.id, userId);
  }
}

// Vacation Periods
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  return vacations.filter((v) => v.userId === userId);
}

export async function getVacationsByProfessional(professionalId: string, userId: string): Promise<VacationPeriod[]> {
  const vacations = await getVacationPeriods(userId);
  return vacations.filter((v) => v.professionalId === professionalId);
}

export async function createVacationPeriod(vacation: Readonly<VacationPeriod>): Promise<VacationPeriod> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  vacations.push(vacation);
  await writeJsonFile(VACATIONS_FILE, vacations);
  return vacation;
}

export async function updateVacationPeriod(
  id: string,
  userId: string,
  updates: Readonly<Partial<VacationPeriod>>
): Promise<VacationPeriod | null> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  const index = vacations.findIndex((v) => v.id === id && v.userId === userId);

  if (index === -1) return null;

  const updated = { ...vacations[index], ...updates } as VacationPeriod;
  vacations[index] = updated;
  await writeJsonFile(VACATIONS_FILE, vacations);
  return updated;
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  const filtered = vacations.filter((v) => !(v.id === id && v.userId === userId));

  if (filtered.length === vacations.length) return false;

  await writeJsonFile(VACATIONS_FILE, filtered);
  return true;
}

export async function deleteAllVacationPeriods(userId: string): Promise<void> {
  const vacations = await getVacationPeriods(userId);
  for (const v of vacations) {
    // eslint-disable-next-line no-await-in-loop -- sequential deletion required for data consistency
    await deleteVacationPeriod(v.id, userId);
  }
}

// Initialize demo data in memory storage (for serverless)
export async function initializeMemoryStorage(
  demoData: Readonly<{ user: User; professionals: Professional[]; vacations: VacationPeriod[] }>
): Promise<void> {
  if (IS_SERVERLESS) {
    memoryStorage.users = [demoData.user];
    memoryStorage.professionals = demoData.professionals;
    memoryStorage.vacations = demoData.vacations;
  }
}