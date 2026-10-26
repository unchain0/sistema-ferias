import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { updateProfessional, deleteProfessional } from '@/lib/db-switch';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

interface UpdateProfessionalBody {
  readonly name: string;
  readonly clientManager: string;
  readonly monthlyRevenue: string | number;
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
    const data = (await request.json()) as UpdateProfessionalBody;
    const updates = {
      name: data.name,
      clientManager: data.clientManager,
      monthlyRevenue: Number.parseFloat(String(data.monthlyRevenue)),
    };

    const professional = await updateProfessional(id, session.user.id, updates);

    if (professional === null) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Update professional error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar profissional' },
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
    const success = await deleteProfessional(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Profissional excluído com sucesso' });
  } catch (error) {
    console.error('Delete professional error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir profissional' },
      { status: 500 }
    );
  }
}