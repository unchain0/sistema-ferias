import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { VACATION_ORDER_FIELDS } from '@/lib/constants';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { vacationService } from '@/lib/di';
import { vacationSchema } from '@/lib/input-validation';
import { getPaginationOptions } from '@/lib/pagination-utils';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Use centralized pagination parsing
  const options = getPaginationOptions(request.url, VACATION_ORDER_FIELDS);

  // Use Service Layer
  const result = await vacationService.getVacations(session.user.id, options);

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

    // Business logic (calculations, etc.) moved to the service layer
    const created = await vacationService.createVacation(session.user.id, validation.data);

    const headers = new Headers();
    // Ensure mutations are never cached
    headers.set('Cache-Control', 'no-store');
    return NextResponse.json(created, { status: 201, headers });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFESSIONAL_NOT_FOUND') {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }
    console.error('Create vacation error:', error);
    return NextResponse.json({ error: 'Erro ao criar período de férias' }, { status: 500 });
  }
}
