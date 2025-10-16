import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { updateProfessional, deleteProfessional } from '@/lib/db';
import { isDemoUser, createDemoProtectionResponse } from '@/lib/demo-protection';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const data = await request.json();
    const updates = {
      name: data.name,
      clientManager: data.clientManager,
      monthlyRevenue: parseFloat(data.monthlyRevenue),
    };

    const professional = await updateProfessional(params.id, session.user.id, updates);

    if (!professional) {
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
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return createDemoProtectionResponse();
  }

  try {
    const success = await deleteProfessional(params.id, session.user.id);

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
