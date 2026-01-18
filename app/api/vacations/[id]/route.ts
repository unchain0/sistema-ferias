import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { vacationService } from '@/lib/di';
import { uuidSchema, vacationUpdateSchema } from '@/lib/input-validation';

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

    // Business logic (merging, calculations) moved to service layer
    const vacation = await vacationService.updateVacation(id, session.user.id, validation.data);

    if (!vacation) {
      return NextResponse.json({ error: 'Período de férias não encontrado' }, { status: 404 });
    }

    return NextResponse.json(vacation);
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFESSIONAL_NOT_FOUND') {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }
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

    const success = await vacationService.deleteVacation(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Período de férias não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Período de férias excluído com sucesso' });
  } catch (error) {
    console.error('Delete vacation error:', error);
    return NextResponse.json({ error: 'Erro ao excluir período de férias' }, { status: 500 });
  }
}
