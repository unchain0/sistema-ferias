import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getProfessionals, createProfessional } from '@/lib/db-switch';
import { Professional } from '@/types';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const professionals = await getProfessionals(session.user.id);
  return NextResponse.json(professionals);
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
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: 'Erro ao criar profissional' },
      { status: 500 }
    );
  }
}
