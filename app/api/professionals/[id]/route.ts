import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';
import { professionalService } from '@/lib/di';
import { professionalUpdateSchema, uuidSchema } from '@/lib/input-validation';

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

    // Validate input using Zod schema (transforms/preprocessors handled in schema)
    const validation = professionalUpdateSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMessage || 'Dados inválidos' }, { status: 400 });
    }

    const updates = validation.data;

    const professional = await professionalService.updateProfessional(id, session.user.id, updates);

    if (!professional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Update professional error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar profissional' }, { status: 500 });
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

    // Use Service Layer
    const success = await professionalService.deleteProfessional(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profissional excluído com sucesso' });
  } catch (error) {
    console.error('Delete professional error:', error);
    return NextResponse.json({ error: 'Erro ao excluir profissional' }, { status: 500 });
  }
}
