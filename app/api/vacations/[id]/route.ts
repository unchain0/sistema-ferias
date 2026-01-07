import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import {
  deleteVacationPeriod,
  getProfessionalById,
  getVacationPeriodById,
  updateVacationPeriod,
} from '@/lib/db';
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

    const validatedData = validation.data;

    // Fetch existing vacation to merge with partial updates
    const existingVacation = await getVacationPeriodById(id, session.user.id);
    if (!existingVacation) {
      return NextResponse.json({ error: 'Período de férias não encontrado' }, { status: 404 });
    }

    // Determine the professional ID (use new one if provided, otherwise keep existing)
    const professionalId = validatedData.professionalId ?? existingVacation.professionalId;

    // Validate the professional exists
    const professional = await getProfessionalById(professionalId, session.user.id);
    if (!professional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    // Merge updates with existing values for date calculations
    const usageStartDate = validatedData.usageStartDate ?? existingVacation.usageStartDate;
    const usageEndDate = validatedData.usageEndDate ?? existingVacation.usageEndDate;

    // Recalculate totalDays and revenueDeduction based on merged values
    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    // Build updates object with only provided fields plus recalculated values
    const updates: Record<string, unknown> = {
      totalDays,
      revenueDeduction,
    };

    if (validatedData.professionalId !== undefined) {
      updates.professionalId = validatedData.professionalId;
    }
    if (validatedData.acquisitionStartDate !== undefined) {
      updates.acquisitionStartDate = validatedData.acquisitionStartDate;
    }
    if (validatedData.acquisitionEndDate !== undefined) {
      updates.acquisitionEndDate = validatedData.acquisitionEndDate;
    }
    if (validatedData.usageStartDate !== undefined) {
      updates.usageStartDate = validatedData.usageStartDate;
    }
    if (validatedData.usageEndDate !== undefined) {
      updates.usageEndDate = validatedData.usageEndDate;
    }

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
