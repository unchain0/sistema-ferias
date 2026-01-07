import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { deleteVacationPeriod, getProfessionalById, updateVacationPeriod } from '@/lib/db';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { uuidSchema, vacationUpdateSchema } from '@/lib/input-validation';
import { calculateRevenueDeduction, calculateVacationDays } from '@/lib/utils';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const { id } = await params;

    // Validate ID parameter
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data = await request.json();

    // Validate input using Zod schema
    const validation = vacationUpdateSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMessage || 'Dados inválidos' }, { status: 400 });
    }

    const {
      professionalId,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    } = validation.data;

    const professional = await getProfessionalById(professionalId, session.user.id);

    if (!professional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
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

    if (!vacation) {
      return NextResponse.json({ error: 'Período de férias não encontrado' }, { status: 404 });
    }

    return NextResponse.json(vacation);
  } catch (error) {
    console.error('Update vacation error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar período de férias' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const { id } = await params;

    // Validate ID parameter
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const success = await deleteVacationPeriod(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Período de férias não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Período de férias excluído com sucesso' });
  } catch (error) {
    console.error('Delete vacation error:', error);
    return NextResponse.json({ error: 'Erro ao excluir período de férias' }, { status: 500 });
  }
}
