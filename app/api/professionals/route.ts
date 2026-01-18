import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { PROFESSIONAL_ORDER_FIELDS } from '@/lib/constants';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { professionalService } from '@/lib/di';
import { professionalSchema } from '@/lib/input-validation';
import { getPaginationOptions } from '@/lib/pagination-utils';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Use centralized pagination parsing
  const options = getPaginationOptions(request.url, PROFESSIONAL_ORDER_FIELDS);

  // Use Service Layer
  const result = await professionalService.getProfessionals(session.user.id, options);

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

    // Validate input using Zod schema (transforms are now handled in the schema)
    const validation = professionalSchema.safeParse(data);

    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { error: errorMessage || 'Todos os campos são obrigatórios' },
        { status: 400 },
      );
    }

    const created = await professionalService.createProfessional(session.user.id, validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create professional error:', error);
    return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
  }
}
