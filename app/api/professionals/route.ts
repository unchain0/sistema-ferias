import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { createProfessional, getProfessionals } from '@/lib/db';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : null;
  const offset = offsetParam ? Math.max(parseInt(offsetParam, 10) || 0, 0) : null;

  const all = await getProfessionals(session.user.id);

  let professionals = all;
  if (limit !== null && offset !== null) {
    professionals = all.slice(offset, offset + limit);
  }

  const headers = new Headers();
  headers.set('X-Total-Count', String(all.length));
  headers.set('Cache-Control', 'private, max-age=5, must-revalidate');

  return NextResponse.json(professionals, { headers });
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
    const { name, clientManager, monthlyRevenue } = data;

    if (!name || !clientManager || !monthlyRevenue) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const created = await createProfessional({
      userId: session.user.id,
      name,
      clientManager,
      monthlyRevenue: parseFloat(monthlyRevenue),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create professional error:', error);
    return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
  }
}
