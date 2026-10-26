import { randomBytes } from 'node:crypto';

import { hash } from 'bcryptjs';

import type { User, Professional, VacationPeriod } from '@/types';

import { uuidv7 } from './uuid-v7';

/** Stable UUIDv7 for the read-only demo account (session + seed rows). */
export const DEMO_USER_ID = '01941f29-7c00-7e43-b999-cafa1b9c8ee9';

export interface DemoSnapshot {
  user: User;
  professionals: Professional[];
  vacations: VacationPeriod[];
}

let snapshotPromise: Promise<DemoSnapshot> | null = null;

/** Cached demo dataset used when external storage is unavailable. */
export function getDemoSnapshot(): Promise<DemoSnapshot> {
  snapshotPromise ??= createDemoData();
  return snapshotPromise;
}

export function isDemoUserId(userId?: string | null): boolean {
  return userId === DEMO_USER_ID;
}

export function isDemoEmail(email?: string | null): boolean {
  return (email ?? '').trim().toLowerCase() === DEMO_EMAIL;
}

/** Ensure seed IDs are unique so in-memory maps and tests stay honest. */
export function assertUniqueSeedIds(snapshot: DemoSnapshot): void {
  const professionalIds = snapshot.professionals.map((p) => p.id);
  const vacationIds = snapshot.vacations.map((v) => v.id);
  const uniqueProfessionals = new Set(professionalIds);
  const uniqueVacations = new Set(vacationIds);
  if (uniqueProfessionals.size !== professionalIds.length) {
    throw new Error('Demo seed has duplicate professional IDs');
  }
  if (uniqueVacations.size !== vacationIds.length) {
    throw new Error('Demo seed has duplicate vacation period IDs');
  }
}

function ensureUniqueVacationIds(vacations: VacationPeriod[]): void {
  const seen = new Set<string>();
  for (const vacation of vacations) {
    if (vacation.id === '' || seen.has(vacation.id)) {
      vacation.id = uuidv7();
    }
    seen.add(vacation.id);
  }
}

function createDemoProfessionals(demoUserId: string): Professional[] {
  return [
    {
      id: 'prof-1',
      userId: demoUserId,
      name: 'João Silva',
      clientManager: 'Maria Santos',
      monthlyRevenue: 15_000,
      createdAt: new Date('2025-01-15').toISOString(),
    },
    {
      id: 'prof-2',
      userId: demoUserId,
      name: 'Ana Costa',
      clientManager: 'Carlos Oliveira',
      monthlyRevenue: 18_000,
      createdAt: new Date('2025-01-20').toISOString(),
    },
    {
      id: 'prof-3',
      userId: demoUserId,
      name: 'Pedro Almeida',
      clientManager: 'Juliana Ferreira',
      monthlyRevenue: 12_000,
      createdAt: new Date('2025-02-01').toISOString(),
    },
    {
      id: 'prof-4',
      userId: demoUserId,
      name: 'Carla Mendes',
      clientManager: 'Roberto Lima',
      monthlyRevenue: 20_000,
      createdAt: new Date('2025-02-10').toISOString(),
    },
    {
      id: 'prof-5',
      userId: demoUserId,
      name: 'Lucas Martins',
      clientManager: 'Fernanda Souza',
      monthlyRevenue: 16_000,
      createdAt: new Date('2025-03-01').toISOString(),
    },
    {
      id: 'prof-6',
      userId: demoUserId,
      name: 'Beatriz Rodrigues',
      clientManager: 'André Silva',
      monthlyRevenue: 14_000,
      createdAt: new Date('2025-03-15').toISOString(),
    },
    {
      id: 'prof-7',
      userId: demoUserId,
      name: 'Rafael Santos',
      clientManager: 'Paula Costa',
      monthlyRevenue: 17_000,
      createdAt: new Date('2025-04-01').toISOString(),
    },
    {
      id: 'prof-8',
      userId: demoUserId,
      name: 'Mariana Oliveira',
      clientManager: 'Ricardo Mendes',
      monthlyRevenue: 19_000,
      createdAt: new Date('2025-04-20').toISOString(),
    },
    {
      id: 'prof-9',
      userId: demoUserId,
      name: 'Thiago Souza',
      clientManager: 'Camila Rocha',
      monthlyRevenue: 15_500,
      createdAt: new Date('2025-05-01').toISOString(),
    },
    {
      id: 'prof-10',
      userId: demoUserId,
      name: 'Patricia Lima',
      clientManager: 'Eduardo Santos',
      monthlyRevenue: 16_500,
      createdAt: new Date('2025-05-15').toISOString(),
    },
    {
      id: 'prof-11',
      userId: demoUserId,
      name: 'Gabriel Ferreira',
      clientManager: 'Amanda Silva',
      monthlyRevenue: 13_500,
      createdAt: new Date('2025-06-01').toISOString(),
    },
    {
      id: 'prof-12',
      userId: demoUserId,
      name: 'Juliana Matos',
      clientManager: 'Leonardo Costa',
      monthlyRevenue: 17_500,
      createdAt: new Date('2025-06-15').toISOString(),
    },
  ];
}

function createDemoVacations(demoUserId: string, professionals: Professional[]): VacationPeriod[] {
  const professionalIds = professionals.map((p) => p.id);
  const revenueByProfessional = new Map(professionals.map((p) => [p.id, p.monthlyRevenue]));

  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

  const lastDay = (year: number, month: number): number => new Date(year, month, 0).getDate();

  const demoVacations: VacationPeriod[] = [];

  function getProfessionalId(index: number): string {
    const id = professionalIds[index % professionalIds.length];
    if (id === undefined) throw new Error('No professionals available');
    return id;
  }

  function addVacation(
    year: number,
    month: number,
    day: number,
    duration: number,
    professionalIndex: number,
    idSuffix: string,
    acquisitionYear: number
  ): void {
    const professionalId = getProfessionalId(professionalIndex);
    const lastDayOfMonth = lastDay(year, month);
    const totalDays = Math.max(1, Math.min(duration, lastDayOfMonth - day + 1));
    const start = `${year}-${pad(month)}-${pad(day)}`;
    const endDay = day + totalDays - 1;
    const end = `${year}-${pad(month)}-${pad(endDay)}`;
    const dailyRate = (revenueByProfessional.get(professionalId) ?? 0) / 30;
    const revenue = Number.parseFloat((dailyRate * totalDays).toFixed(2));
    demoVacations.push({
      id: `vac-${year}-${pad(month)}-${idSuffix}`,
      professionalId,
      userId: demoUserId,
      acquisitionStartDate: `${acquisitionYear}-01-01`,
      acquisitionEndDate: `${acquisitionYear}-12-31`,
      usageStartDate: start,
      usageEndDate: end,
      totalDays,
      revenueDeduction: revenue,
      createdAt: new Date(`${year}-${pad(month)}-01`).toISOString(),
    });
  }

  // Janeiro
  addVacation(2025, 1, 8, 12, 0, 'a', 2023);
  addVacation(2025, 1, 22, 14, 5, 'b', 2023);
  addVacation(2025, 1, 24, 7, 8, 'c', 2023);

  // Fevereiro
  addVacation(2025, 2, 5, 7, 2, 'a', 2023);
  addVacation(2025, 2, 12, 14, 6, 'b', 2023);
  addVacation(2025, 2, 19, 5, 1, 'c', 2023);
  addVacation(2025, 2, 26, 3, 9, 'd', 2023);

  // Março
  addVacation(2025, 3, 1, 15, 3, 'a', 2023);
  addVacation(2025, 3, 18, 7, 7, 'b', 2023);
  addVacation(2025, 3, 25, 7, 10, 'c', 2023);

  // Abril
  addVacation(2025, 4, 8, 10, 4, 'a', 2023);
  addVacation(2025, 4, 15, 5, 0, 'b', 2025);
  addVacation(2025, 4, 22, 7, 11, 'c', 2023);
  addVacation(2025, 4, 29, 2, 8, 'd', 2025);

  // Maio
  addVacation(2025, 5, 1, 10, 5, 'a', 2023);
  addVacation(2025, 5, 13, 15, 6, 'b', 2025);
  addVacation(2025, 5, 20, 5, 2, 'c', 2025);
  addVacation(2025, 5, 27, 5, 9, 'd', 2023);

  // Junho
  addVacation(2025, 6, 3, 14, 1, 'a', 2025);
  addVacation(2025, 6, 10, 5, 7, 'b', 2025);
  addVacation(2025, 6, 17, 5, 10, 'c', 2023);
  addVacation(2025, 6, 24, 7, 3, 'd', 2023);

  // Julho
  addVacation(2025, 7, 1, 20, 3, 'a', 2025);
  addVacation(2025, 7, 1, 5, 4, 'b', 2025);
  addVacation(2025, 7, 8, 7, 5, 'c', 2023);
  addVacation(2025, 7, 15, 5, 0, 'd', 2025);
  addVacation(2025, 7, 22, 5, 11, 'e', 2025);
  addVacation(2025, 7, 29, 3, 8, 'f', 2025);

  // Agosto
  addVacation(2025, 8, 5, 14, 5, 'a', 2025);
  addVacation(2025, 8, 12, 5, 6, 'b', 2025);
  addVacation(2025, 8, 19, 5, 1, 'c', 2025);
  addVacation(2025, 8, 26, 5, 9, 'd', 2025);

  // Setembro
  addVacation(2025, 9, 2, 14, 2, 'a', 2025);
  addVacation(2025, 9, 16, 5, 7, 'b', 2025);
  addVacation(2025, 9, 23, 5, 10, 'c', 2025);

  // Outubro
  addVacation(2025, 10, 1, 10, 1, 'a', 2025);
  addVacation(2025, 10, 14, 5, 3, 'b', 2025);
  addVacation(2025, 10, 21, 5, 11, 'c', 2025);

  // Novembro
  addVacation(2025, 11, 4, 14, 4, 'a', 2025);
  addVacation(2025, 11, 20, 3, 0, 'b', 2025);
  addVacation(2025, 11, 25, 5, 5, 'c', 2025);

  // Dezembro
  addVacation(2025, 12, 2, 7, 5, 'a', 2025);
  addVacation(2025, 12, 9, 5, 6, 'b', 2025);
  addVacation(2025, 12, 16, 5, 2, 'c', 2025);
  addVacation(2025, 12, 23, 5, 8, 'd', 2025);
  addVacation(2025, 12, 26, 6, 1, 'e', 2025);
  addVacation(2025, 12, 28, 4, 4, 'f', 2025);
  addVacation(2025, 12, 29, 3, 0, 'g', 2025);

  ensureUniqueVacationIds(demoVacations);
  return demoVacations;
}

export async function createDemoData(): Promise<DemoSnapshot> {
  const demoUserId = DEMO_USER_ID;

  const demoUser: User = {
    id: demoUserId,
    email: DEMO_EMAIL,
    name: 'Usuário Demonstração',
    password: await hash(DEMO_PASSWORD, 12),
    createdAt: new Date('2025-01-01').toISOString(),
  };

  const demoProfessionals = createDemoProfessionals(demoUserId);
  const demoVacations = createDemoVacations(demoUserId, demoProfessionals);

  const snapshot: DemoSnapshot = {
    user: demoUser,
    professionals: demoProfessionals,
    vacations: demoVacations,
  };

  assertUniqueSeedIds(snapshot);
  return snapshot;
}

export const DEMO_EMAIL = 'demo@sistema-ferias.com';
export const DEMO_PASSWORD = randomBytes(24).toString('base64url');