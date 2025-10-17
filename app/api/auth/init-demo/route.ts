import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, createProfessional, createVacationPeriod } from '@/lib/db-switch';
import { createDemoData } from '@/lib/seed-demo';

export async function POST() {
  try {
    const demoData = await createDemoData();

    const existingUser = await getUserByEmail(demoData.user.email);

    if (!existingUser) {
      const user = await createUser({
        email: demoData.user.email,
        name: demoData.user.name,
        password: demoData.user.password,
      });

      const profIdMap: Record<string, string> = {};
      for (const p of demoData.professionals) {
        const created = await createProfessional({
          userId: user.id,
          name: p.name,
          clientManager: p.clientManager,
          monthlyRevenue: p.monthlyRevenue,
        });
        profIdMap[p.id] = created.id;
      }

      for (const v of demoData.vacations) {
        const mappedProfessionalId = profIdMap[v.professionalId];
        if (!mappedProfessionalId) {
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
