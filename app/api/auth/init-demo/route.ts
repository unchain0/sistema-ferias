import { NextResponse } from 'next/server';

import {
  getUserByEmail,
  createUser,
  createProfessional,
  createVacationPeriod,
  deleteAllProfessionals,
  deleteAllVacationPeriods,
  getProfessionals,
  getVacationPeriods,
} from '@/lib/db-switch';
import { getDemoSnapshot } from '@/lib/seed-demo';
import { isStorageUnavailable } from '@/lib/storage-errors';

interface PersistResult {
  readonly skipped: boolean;
  readonly createdProfessionals: number;
  readonly createdVacations: number;
  readonly totalProfessionals: number;
  readonly totalVacations: number;
}

async function persistDemoData(
  demoData: Awaited<ReturnType<typeof getDemoSnapshot>>
): Promise<PersistResult> {
  let user = await getUserByEmail(demoData.user.email);
  if (user !== null) {
    const existingProfessionals = await getProfessionals(user.id);
    const existingVacations = await getVacationPeriods(user.id);
    const seedProfessionalsCount = demoData.professionals.length;
    const seedVacationsCount = demoData.vacations.length;
    if (
      existingProfessionals.length === seedProfessionalsCount &&
      existingVacations.length === seedVacationsCount
    ) {
      return {
        skipped: true,
        createdProfessionals: 0,
        createdVacations: 0,
        totalProfessionals: existingProfessionals.length,
        totalVacations: existingVacations.length,
      };
    }

    await deleteAllVacationPeriods(user.id);
    await deleteAllProfessionals(user.id);
  } else {
    user = await createUser({
      email: demoData.user.email,
      name: demoData.user.name,
      password: demoData.user.password,
    });
  }

  const professionalIdMap: Record<string, string> = {};
  let createdProfessionals = 0;
  for (const p of demoData.professionals) {
    const created = await createProfessional({
      userId: user.id,
      name: p.name,
      clientManager: p.clientManager,
      monthlyRevenue: p.monthlyRevenue,
    });
    professionalIdMap[p.id] = created.id;
    createdProfessionals++;
  }

  let createdVacations = 0;
  for (const v of demoData.vacations) {
    const mappedProfessionalId = professionalIdMap[v.professionalId];
    if (mappedProfessionalId === undefined) continue;
    await createVacationPeriod({
      professionalId: mappedProfessionalId,
      userId: user.id,
      acquisitionStartDate: v.acquisitionStartDate,
      acquisitionEndDate: v.acquisitionEndDate,
      usageStartDate: v.usageStartDate,
      usageEndDate: v.usageEndDate,
      totalDays: v.totalDays,
      revenueDeduction: v.revenueDeduction,
    });
    createdVacations++;
  }

  const totalProfessionals = (await getProfessionals(user.id)).length;
  const totalVacations = (await getVacationPeriods(user.id)).length;

  return {
    skipped: false,
    createdProfessionals,
    createdVacations,
    totalProfessionals,
    totalVacations,
  };
}

export async function POST(): Promise<ReturnType<typeof NextResponse.json>> {
  try {
    // Always build the in-process seed first so demo login can proceed
    // even when external storage (Supabase) is unreachable.
    const demoData = await getDemoSnapshot();

    try {
      const persisted = await persistDemoData(demoData);
      return NextResponse.json({
        message: persisted.skipped
          ? 'Dados demo já estavam atualizados (sem reinicialização)'
          : 'Dados demo inicializados com sucesso',
        email: demoData.user.email,
        createdProfessionals: persisted.createdProfessionals,
        createdVacations: persisted.createdVacations,
        totalProfessionals: persisted.totalProfessionals,
        totalVacations: persisted.totalVacations,
        skipped: persisted.skipped,
        storage: 'persisted',
      });
    } catch (storageError) {
      console.error('Demo persistence failed; serving seed snapshot:', storageError);
      if (!isStorageUnavailable(storageError)) {
        // Unexpected logical errors still surface as 500.
        // Network/DNS/fetch failures fall through to seed-only success.
        const message = storageError instanceof Error ? storageError.message : String(storageError);
        if (!/fetch failed|ENOTFOUND|ECONNREFUSED|duplicate|unique/i.test(message)) {
          throw storageError;
        }
      }

      return NextResponse.json({
        message: 'Dados demo disponíveis (armazenamento externo indisponível)',
        email: demoData.user.email,
        createdProfessionals: demoData.professionals.length,
        createdVacations: demoData.vacations.length,
        totalProfessionals: demoData.professionals.length,
        totalVacations: demoData.vacations.length,
        skipped: false,
        storage: 'seed',
      });
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar dados demo' },
      { status: 500 }
    );
  }
}