'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { createProfessional, updateProfessional, deleteProfessional } from '@/lib/db';
import { isDemoUser } from '@/lib/demo-protection';
import { revalidatePath } from 'next/cache';

export async function createProfessionalAction(formData: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  const { name, clientManager, monthlyRevenue } = formData;

  if (!name || !clientManager || !monthlyRevenue) {
    return { error: 'Todos os campos são obrigatórios' };
  }

  try {
    await createProfessional({
      userId: session.user.id,
      name,
      clientManager,
      monthlyRevenue: parseFloat(monthlyRevenue),
    });

    revalidatePath('/professionals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create professional error:', error);
    return { error: 'Erro ao criar profissional' };
  }
}

export async function updateProfessionalAction(id: string, formData: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  const { name, clientManager, monthlyRevenue } = formData;

  try {
    await updateProfessional(id, session.user.id, {
      name,
      clientManager,
      monthlyRevenue: monthlyRevenue ? parseFloat(monthlyRevenue) : undefined,
    });

    revalidatePath('/professionals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update professional error:', error);
    return { error: 'Erro ao atualizar profissional' };
  }
}

export async function deleteProfessionalAction(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  try {
    await deleteProfessional(id, session.user.id);
    revalidatePath('/professionals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete professional error:', error);
    return { error: 'Erro ao excluir profissional' };
  }
}
