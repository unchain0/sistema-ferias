import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { updateVacationPeriod, deleteVacationPeriod, getProfessionalById } from '@/lib/db-switch';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';
import { calculateVacationDays, calculateRevenueDeduction } from '@/lib/utils';

interface UpdateVacationBody {
  readonly professionalId: string;
  readonly acquisitionStartDate: string;
  readonly acquisitionEndDate: string;
  readonly usageStartDate: string;
  readonly usageEndDate: string;
}

type RouteParameters = Promise<{ id: string }>;

export async function PUT(
  request: Request,
  { params }: { params: RouteParameters }
): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const { id } = await params;
    const data = (await request.json()) as UpdateVacationBody;
    const {
      professionalId,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    } = data;

    const professional = await getProfessionalById(professionalId, session.user.id);

    if (professional === null) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    const updates = {
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
      totalDays,
      revenueDeduction,
    };

    const vacation = await updateVacationPeriod(id, session.user.id, updates);

    if (vacation === null) {
      return NextResponse.json(
        { error: 'Período de férias não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(vacation);
  } catch (error) {
    console.error('Update vacation error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar período de férias' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: RouteParameters }
): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const { id } = await params;
    const success = await deleteVacationPeriod(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Período de férias não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Período de férias excluído com sucesso' });
  } catch (error) {
    console.error('Delete vacation error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir período de férias' },
      { status: 500 }
    );
  }
}