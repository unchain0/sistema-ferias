import {
  IProfessionalRepository,
  IVacationRepository,
  PaginatedResult,
  PaginationOptions,
} from '@/interfaces/repositories';
import { calculateRevenueDeduction, calculateVacationDays } from '@/lib/utils';
import { VacationPeriod } from '@/types';

export class VacationService {
  constructor(
    private vacationRepo: IVacationRepository,
    private professionalRepo: IProfessionalRepository,
  ) {}

  async getVacations(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VacationPeriod>> {
    return this.vacationRepo.getVacationPeriodsPaginated(userId, options);
  }

  async getVacationById(id: string, userId: string): Promise<VacationPeriod | null> {
    return this.vacationRepo.getVacationPeriodById(id, userId);
  }

  async createVacation(
    userId: string,
    data: {
      professionalId: string;
      acquisitionStartDate: string;
      acquisitionEndDate: string;
      usageStartDate: string;
      usageEndDate: string;
    },
  ): Promise<VacationPeriod> {
    const professional = await this.professionalRepo.getProfessionalById(
      data.professionalId,
      userId,
    );
    if (!professional) {
      throw new Error('PROFESSIONAL_NOT_FOUND');
    }

    const totalDays = calculateVacationDays(data.usageStartDate, data.usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    return this.vacationRepo.createVacationPeriod({
      ...data,
      userId,
      totalDays,
      revenueDeduction,
    });
  }

  async updateVacation(
    id: string,
    userId: string,
    updates: Partial<{
      professionalId: string;
      acquisitionStartDate: string;
      acquisitionEndDate: string;
      usageStartDate: string;
      usageEndDate: string;
    }>,
  ): Promise<VacationPeriod | null> {
    const existing = await this.vacationRepo.getVacationPeriodById(id, userId);
    if (!existing) return null;

    const professionalId = updates.professionalId ?? existing.professionalId;
    const professional = await this.professionalRepo.getProfessionalById(professionalId, userId);
    if (!professional) {
      throw new Error('PROFESSIONAL_NOT_FOUND');
    }

    const usageStartDate = updates.usageStartDate ?? existing.usageStartDate;
    const usageEndDate = updates.usageEndDate ?? existing.usageEndDate;

    const totalDays = calculateVacationDays(usageStartDate, usageEndDate);
    const revenueDeduction = calculateRevenueDeduction(professional.monthlyRevenue, totalDays);

    return this.vacationRepo.updateVacationPeriod(id, userId, {
      ...updates,
      totalDays,
      revenueDeduction,
    });
  }

  async deleteVacation(id: string, userId: string): Promise<boolean> {
    return this.vacationRepo.deleteVacationPeriod(id, userId);
  }
}
