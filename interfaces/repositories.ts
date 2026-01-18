import { Professional, User, VacationPeriod } from '@/types';

/**
 * Pagination and ordering options for list queries
 */
export interface PaginationOptions {
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Result type for paginated queries
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IUserRepository {
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}

export interface IProfessionalRepository {
  /**
   * Get professionals with database-level pagination and ordering
   */
  getProfessionalsPaginated(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Professional>>;

  getProfessionalById(id: string, userId: string): Promise<Professional | null>;
  createProfessional(
    professional: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Professional>;
  updateProfessional(
    id: string,
    userId: string,
    updates: Partial<Professional>,
  ): Promise<Professional | null>;
  deleteProfessional(id: string, userId: string): Promise<boolean>;
  deleteAllProfessionals(userId: string): Promise<void>;
}

export interface IVacationRepository {
  /**
   * Get vacation periods with database-level pagination and ordering
   */
  getVacationPeriodsPaginated(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VacationPeriod>>;

  getVacationPeriodById(id: string, userId: string): Promise<VacationPeriod | null>;
  getVacationsByProfessional(professionalId: string, userId: string): Promise<VacationPeriod[]>;
  createVacationPeriod(
    vacation: Omit<VacationPeriod, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<VacationPeriod>;
  updateVacationPeriod(
    id: string,
    userId: string,
    updates: Partial<VacationPeriod>,
  ): Promise<VacationPeriod | null>;
  deleteVacationPeriod(id: string, userId: string): Promise<boolean>;
  deleteAllVacationPeriods(userId: string): Promise<void>;
}
