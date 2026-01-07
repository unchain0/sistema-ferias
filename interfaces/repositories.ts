import { Professional, User, VacationPeriod } from '@/types';

export interface IUserRepository {
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
}

export interface IProfessionalRepository {
  getProfessionals(userId: string): Promise<Professional[]>;
  getProfessionalById(id: string, userId: string): Promise<Professional | null>;
  createProfessional(professional: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional>;
  updateProfessional(
    id: string,
    userId: string,
    updates: Partial<Professional>,
  ): Promise<Professional | null>;
  deleteProfessional(id: string, userId: string): Promise<boolean>;
}

export interface IVacationRepository {
  getVacationPeriods(userId: string): Promise<VacationPeriod[]>;
  getVacationsByProfessional(professionalId: string, userId: string): Promise<VacationPeriod[]>;
  createVacationPeriod(vacation: Omit<VacationPeriod, 'id' | 'createdAt'>): Promise<VacationPeriod>;
  updateVacationPeriod(
    id: string,
    userId: string,
    updates: Partial<VacationPeriod>,
  ): Promise<VacationPeriod | null>;
  deleteVacationPeriod(id: string, userId: string): Promise<boolean>;
}
