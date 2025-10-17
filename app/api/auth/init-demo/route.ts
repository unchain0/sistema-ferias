import { NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  createUser, 
  createProfessional, 
  createVacationPeriod, 
  getProfessionals, 
  getVacationPeriods,
  updateProfessional,
  updateVacationPeriod,
} from '@/lib/db-switch';
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
        const updates: Partial<typeof existing> = {};
        if (existing.clientManager !== p.clientManager) updates.clientManager = p.clientManager as any;
        if (existing.monthlyRevenue !== p.monthlyRevenue) updates.monthlyRevenue = p.monthlyRevenue as any;
        if (existing.name !== p.name) updates.name = p.name as any;
        if (Object.keys(updates).length > 0) {
          await updateProfessional(existing.id, user.id, updates as any);
        }
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
    const key = (pId: string, s: string, e: string) => `${pId}|${s}|${e}`;
    const existingByKey = new Map(existingVacations.map(ev => [key(ev.professionalId, ev.usageStartDate, ev.usageEndDate), ev]));

    for (const v of demoData.vacations) {
      const mappedProfessionalId = profIdMap[v.professionalId];
      if (!mappedProfessionalId) continue;
      const k = key(mappedProfessionalId, v.usageStartDate, v.usageEndDate);
      const found = existingByKey.get(k);
      if (found) {
        const updates: Partial<typeof found> = {};
        if (found.totalDays !== v.totalDays) updates.totalDays = v.totalDays as any;
        if (found.revenueDeduction !== v.revenueDeduction) updates.revenueDeduction = v.revenueDeduction as any;
        if (found.acquisitionStartDate !== v.acquisitionStartDate) updates.acquisitionStartDate = v.acquisitionStartDate as any;
        if (found.acquisitionEndDate !== v.acquisitionEndDate) updates.acquisitionEndDate = v.acquisitionEndDate as any;
        if (Object.keys(updates).length > 0) {
          await updateVacationPeriod(found.id, user.id, updates as any);
        }
        continue;
      }
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
