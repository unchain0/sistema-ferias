import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  VACATION_ORDER_FIELDS,
} from '@/lib/constants';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { professionalRepository, vacationRepository } from '@/lib/di';
import { vacationSchema } from '@/lib/input-validation';
import { calculateRevenueDeduction, calculateVacationDays } from '@/lib/utils';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Parse pagination and ordering params with sensible defaults
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const orderParam = searchParams.get('order') || 'createdAt:desc';

  const limit = Math.min(
    Math.max(
      parseInt(limitParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE,
      MIN_PAGE_SIZE,
    ),
    MAX_PAGE_SIZE,
  );
  const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0);

  const [orderField, orderDir] = orderParam.split(':');

  // Validate orderField using constants
  const validatedOrderField = VACATION_ORDER_FIELDS.includes(
    orderField as (typeof VACATION_ORDER_FIELDS)[number],
  )
    ? orderField
    : 'createdAt';

  // Use database-level pagination for better performance
  const result = await vacationRepository.getVacationPeriodsPaginated(session.user.id, {
    orderBy: validatedOrderField,
    orderDir: (orderDir?.toLowerCase() as 'asc' | 'desc') || 'desc',
    limit,
    offset,
  });

  const headers = new Headers();
  headers.set('X-Total-Count', String(result.total));
  // Private caching for logged-in user with must-revalidate to ensure data consistency
  headers.set('Cache-Control', 'private, max-age=5, must-revalidate');
  headers.set('Vary', 'Cookie');

  return NextResponse.json(result.data, { headers });
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

    // Validate input using Zod schema
    const validation = vacationSchema.safeParse(data);
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

    const professional = await professionalRepository.getProfessionalById(
      professionalId,
      session.user.id,
    );

    if (!professional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    const created = await vacationRepository.createVacationPeriod({
      professionalId,
      userId: session.user.id,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
      totalDays,
      revenueDeduction,
    });
    const headers = new Headers();
    // Ensure mutations are never cached
    headers.set('Cache-Control', 'no-store');
    return NextResponse.json(created, { status: 201, headers });
  } catch (error) {
    console.error('Create vacation error:', error);
    return NextResponse.json({ error: 'Erro ao criar período de férias' }, { status: 500 });
  }
}
