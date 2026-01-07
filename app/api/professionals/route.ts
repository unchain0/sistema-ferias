import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  PROFESSIONAL_ORDER_FIELDS,
} from '@/lib/constants';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { professionalRepository } from '@/lib/di';
import { professionalSchema } from '@/lib/input-validation';

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
  const validatedOrderField = PROFESSIONAL_ORDER_FIELDS.includes(
    orderField as (typeof PROFESSIONAL_ORDER_FIELDS)[number],
  )
    ? orderField
    : 'createdAt';

  // Use database-level pagination for better performance
  const result = await professionalRepository.getProfessionalsPaginated(session.user.id, {
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
    const validation = professionalSchema.safeParse({
      name: data.name,
      clientManager: data.clientManager,
      monthlyRevenue:
        typeof data.monthlyRevenue === 'string'
          ? parseFloat(data.monthlyRevenue)
          : data.monthlyRevenue,
    });

    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Todos os campos são obrigatórios' },
        { status: 400 },
      );
    }

    const { name, clientManager, monthlyRevenue } = validation.data;

    const created = await professionalRepository.createProfessional({
      userId: session.user.id,
      name,
      clientManager,
      monthlyRevenue,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create professional error:', error);
    return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
  }
}
