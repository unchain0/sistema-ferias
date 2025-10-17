import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getVacationPeriods, createVacationPeriod, getProfessionalById } from '@/lib/db-switch';
import { VacationPeriod } from '@/types';
import { calculateVacationDays, calculateRevenueDeduction } from '@/lib/utils';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const vacations = await getVacationPeriods(session.user.id);
  return NextResponse.json(vacations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const data = await request.json();
    const {
      professionalId,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    } = data;

    if (!professionalId || !acquisitionStartDate || !acquisitionEndDate || !usageStartDate || !usageEndDate) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const professional = await getProfessionalById(professionalId, session.user.id);
    
    if (!professional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    const created = await createVacationPeriod({
      professionalId,
      userId: session.user.id,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
      totalDays,
      revenueDeduction,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create vacation error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar período de férias' },
      { status: 500 }
    );
  }
}
