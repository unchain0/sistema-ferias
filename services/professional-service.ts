import {
  IProfessionalRepository,
  PaginatedResult,
  PaginationOptions,
} from '@/interfaces/repositories';
import { Professional } from '@/types';

export class ProfessionalService {
  constructor(private professionalRepo: IProfessionalRepository) {}

  async getProfessionals(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Professional>> {
    return this.professionalRepo.getProfessionalsPaginated(userId, options);
  }

  async getProfessionalById(id: string, userId: string): Promise<Professional | null> {
    return this.professionalRepo.getProfessionalById(id, userId);
  }

  async createProfessional(
    userId: string,
    data: { name: string; clientManager: string; monthlyRevenue: number },
  ): Promise<Professional> {
    return this.professionalRepo.createProfessional({
      ...data,
      userId,
    });
  }

  async updateProfessional(
    id: string,
    userId: string,
    updates: Partial<Omit<Professional, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Professional | null> {
    return this.professionalRepo.updateProfessional(id, userId, updates);
  }

  async deleteProfessional(id: string, userId: string): Promise<boolean> {
    return this.professionalRepo.deleteProfessional(id, userId);
  }
}
