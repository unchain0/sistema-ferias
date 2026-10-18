import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { getProfessionals, createProfessional } from '@/lib/db-switch';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

interface CreateProfessionalBody {
  readonly name: string;
  readonly clientManager: string;
  readonly monthlyRevenue: string | number;
}

export async function GET(): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const professionals = await getProfessionals(session.user.id);
  return NextResponse.json(professionals);
}

export async function POST(request: Request): Promise<ReturnType<typeof NextResponse.json>> {
  const session = await getServerSession(authOptions);

  if (session?.user?.id === undefined) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const data = (await request.json()) as CreateProfessionalBody;
    const { name, clientManager, monthlyRevenue } = data;

    if (
      typeof name !== 'string' ||
      name.trim() === '' ||
      typeof clientManager !== 'string' ||
      clientManager.trim() === '' ||
      monthlyRevenue === undefined ||
      monthlyRevenue === null ||
      (typeof monthlyRevenue === 'string' && monthlyRevenue.trim() === '')
    ) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const created = await createProfessional({
      userId: session.user.id,
      name,
      clientManager,
      monthlyRevenue: Number.parseFloat(String(monthlyRevenue)),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create professional error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar profissional' },
      { status: 500 }
    );
  }
}