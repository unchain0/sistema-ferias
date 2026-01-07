'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-config';
import { isDemoUser } from '@/lib/demo-protection';
import { professionalRepository, vacationRepository } from '@/lib/di';
import { calculateRevenueDeduction, calculateVacationDays } from '@/lib/utils';

interface VacationFormData {
  professionalId: string;
  acquisitionStartDate: string;
  acquisitionEndDate: string;
  usageStartDate: string;
  usageEndDate: string;
}

export async function createVacation(formData: VacationFormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  const { professionalId, acquisitionStartDate, acquisitionEndDate, usageStartDate, usageEndDate } =
    formData;

  if (
    !professionalId ||
    !acquisitionStartDate ||
    !acquisitionEndDate ||
    !usageStartDate ||
    !usageEndDate
  ) {
    return { error: 'Todos os campos são obrigatórios' };
  }

  try {
    const professional = await professionalRepository.getProfessionalById(
      professionalId,
      session.user.id,
    );

    if (!professional) {
      return { error: 'Profissional não encontrado' };
    }

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    await vacationRepository.createVacationPeriod({
      professionalId,
      userId: session.user.id,
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
      totalDays,
      revenueDeduction,
    });

    revalidatePath('/vacations');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create vacation error:', error);
    return { error: 'Erro ao criar período de férias' };
  }
}

export async function updateVacation(id: string, formData: Partial<VacationFormData>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  try {
    const {
      professionalId,
      usageStartDate,
      usageEndDate,
      acquisitionStartDate,
      acquisitionEndDate,
    } = formData;

    const updates: Partial<VacationFormData & { totalDays: number; revenueDeduction: number }> = {
      acquisitionStartDate,
      acquisitionEndDate,
      usageStartDate,
      usageEndDate,
    };

    if (usageStartDate && usageEndDate && professionalId) {
      const professional = await professionalRepository.getProfessionalById(
        professionalId,
        session.user.id,
      );
      if (professional) {
        const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
        const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);
        updates.totalDays = totalDays;
        updates.revenueDeduction = revenueDeduction;
      }
    }

    await vacationRepository.updateVacationPeriod(id, session.user.id, updates);

    revalidatePath('/vacations');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update vacation error:', error);
    return { error: 'Erro ao atualizar período de férias' };
  }
}

export async function deleteVacation(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Não autorizado' };
  }

  if (isDemoUser(session.user.email)) {
    return { error: 'Ação não permitida no modo de demonstração' };
  }

  try {
    await vacationRepository.deleteVacationPeriod(id, session.user.id);
    revalidatePath('/vacations');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete vacation error:', error);
    return { error: 'Erro ao excluir período de férias' };
  }
}
