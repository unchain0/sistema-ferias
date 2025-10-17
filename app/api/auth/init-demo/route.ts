import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, createProfessional, createVacationPeriod, getProfessionals, getVacationPeriods } from '@/lib/db-switch';
import { createDemoData } from '@/lib/seed-demo';

export async function POST() {
  try {
    const demoData = await createDemoData();

    let user = await getUserByEmail(demoData.user.email);
    if (!user) {
      user = await createUser({
        email: demoData.user.email,
        name: demoData.user.name,
        password: demoData.user.password,
      });
    }

    const existingProfessionals = await getProfessionals(user.id);
    const professionalsByName = new Map(existingProfessionals.map(p => [p.name, p]));

    const profIdMap: Record<string, string> = {};
    for (const p of demoData.professionals) {
      const existing = professionalsByName.get(p.name);
      if (existing) {
        profIdMap[p.id] = existing.id;
        continue;
      }
      const created = await createProfessional({
        userId: user.id,
        name: p.name,
        clientManager: p.clientManager,
        monthlyRevenue: p.monthlyRevenue,
      });
      profIdMap[p.id] = created.id;
    }

    const existingVacations = await getVacationPeriods(user.id);
    for (const v of demoData.vacations) {
      const mappedProfessionalId = profIdMap[v.professionalId];
      if (!mappedProfessionalId) continue;
      const already = existingVacations.find(ev => 
        ev.professionalId === mappedProfessionalId &&
        ev.usageStartDate === v.usageStartDate &&
        ev.usageEndDate === v.usageEndDate
      );
      if (already) continue;
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
    }

    return NextResponse.json({ 
      message: 'Dados demo inicializados com sucesso',
      email: demoData.user.email 
    });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar dados demo' },
      { status: 500 }
    );
  }
}
