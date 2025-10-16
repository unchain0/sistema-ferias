import { User, Professional, VacationPeriod } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFESSIONALS_FILE = path.join(DATA_DIR, 'professionals.json');
const VACATIONS_FILE = path.join(DATA_DIR, 'vacations.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Users
export async function getUsers(): Promise<User[]> {
  return readJsonFile<User>(USERS_FILE);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function createUser(user: User): Promise<User> {
  const users = await getUsers();
  users.push(user);
  await writeJsonFile(USERS_FILE, users);
  return user;
}

// Professionals
export async function getProfessionals(userId: string): Promise<Professional[]> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  return professionals.filter(p => p.userId === userId);
}

export async function getProfessionalById(id: string, userId: string): Promise<Professional | null> {
  const professionals = await getProfessionals(userId);
  return professionals.find(p => p.id === id) || null;
}

export async function createProfessional(professional: Professional): Promise<Professional> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  professionals.push(professional);
  await writeJsonFile(PROFESSIONALS_FILE, professionals);
  return professional;
}

export async function updateProfessional(id: string, userId: string, updates: Partial<Professional>): Promise<Professional | null> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  const index = professionals.findIndex(p => p.id === id && p.userId === userId);
  
  if (index === -1) return null;
  
  professionals[index] = { ...professionals[index], ...updates };
  await writeJsonFile(PROFESSIONALS_FILE, professionals);
  return professionals[index];
}

export async function deleteProfessional(id: string, userId: string): Promise<boolean> {
  const professionals = await readJsonFile<Professional>(PROFESSIONALS_FILE);
  const filtered = professionals.filter(p => !(p.id === id && p.userId === userId));
  
  if (filtered.length === professionals.length) return false;
  
  await writeJsonFile(PROFESSIONALS_FILE, filtered);
  return true;
}

// Vacation Periods
export async function getVacationPeriods(userId: string): Promise<VacationPeriod[]> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  return vacations.filter(v => v.userId === userId);
}

export async function getVacationsByProfessional(professionalId: string, userId: string): Promise<VacationPeriod[]> {
  const vacations = await getVacationPeriods(userId);
  return vacations.filter(v => v.professionalId === professionalId);
}

export async function createVacationPeriod(vacation: VacationPeriod): Promise<VacationPeriod> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  vacations.push(vacation);
  await writeJsonFile(VACATIONS_FILE, vacations);
  return vacation;
}

export async function updateVacationPeriod(id: string, userId: string, updates: Partial<VacationPeriod>): Promise<VacationPeriod | null> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  const index = vacations.findIndex(v => v.id === id && v.userId === userId);
  
  if (index === -1) return null;
  
  vacations[index] = { ...vacations[index], ...updates };
  await writeJsonFile(VACATIONS_FILE, vacations);
  return vacations[index];
}

export async function deleteVacationPeriod(id: string, userId: string): Promise<boolean> {
  const vacations = await readJsonFile<VacationPeriod>(VACATIONS_FILE);
  const filtered = vacations.filter(v => !(v.id === id && v.userId === userId));
  
  if (filtered.length === vacations.length) return false;
  
  await writeJsonFile(VACATIONS_FILE, filtered);
  return true;
}
