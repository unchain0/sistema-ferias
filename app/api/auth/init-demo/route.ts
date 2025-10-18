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
    } else {
      // Reset demo data: delete existing vacations and professionals
      await deleteAllVacationPeriods(user.id);
      await deleteAllProfessionals(user.id);
    }

    // Create professionals
    const profIdMap: Record<string, string> = {};
    let createdProfessionals = 0;
    for (const p of demoData.professionals) {
      const created = await createProfessional({
        userId: user.id,
        name: p.name,
        clientManager: p.clientManager,
        monthlyRevenue: p.monthlyRevenue,
      });
      profIdMap[p.id] = created.id;
      createdProfessionals++;
    }

    // Create vacations
    let createdVacations = 0;
    for (const v of demoData.vacations) {
      const mappedProfessionalId = profIdMap[v.professionalId];
      if (!mappedProfessionalId) continue;
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

    // Fetch totals to confirm persisted counts
    const totalProfessionals = (await getProfessionals(user.id)).length;
    const totalVacations = (await getVacationPeriods(user.id)).length;

    return NextResponse.json({ 
      message: 'Dados demo inicializados com sucesso',
      email: demoData.user.email,
      createdProfessionals,
      createdVacations,
      totalProfessionals,
      totalVacations,
    });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar dados demo' },
      { status: 500 }
    );
  }
}
