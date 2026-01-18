/**
 * Database row mappers
 * Converts Supabase row data to application models
 * Centralizes the mapping logic to reduce code duplication
 */

import { Professional, User, VacationPeriod } from '@/types';

/**
 * Generic row type from Supabase
 */
type DbRow = Record<string, unknown>;

/**
 * Maps a database user row to the User model
 */
export function mapUserRow(row: DbRow): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    password: row.password as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Maps a database professional row to the Professional model
 */
export function mapProfessionalRow(row: DbRow): Professional {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    clientManager: row.client_manager as string,
    monthlyRevenue:
      typeof row.monthly_revenue === 'string'
        ? parseFloat(row.monthly_revenue)
        : (row.monthly_revenue as number),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Maps a database vacation period row to the VacationPeriod model
 */
export function mapVacationRow(row: DbRow): VacationPeriod {
  return {
    id: row.id as string,
    professionalId: row.professional_id as string,
    userId: row.user_id as string,
    acquisitionStartDate: row.acquisition_start_date as string,
    acquisitionEndDate: row.acquisition_end_date as string,
    usageStartDate: row.usage_start_date as string,
    usageEndDate: row.usage_end_date as string,
    totalDays: row.total_days as number,
    revenueDeduction:
      typeof row.revenue_deduction === 'string'
        ? parseFloat(row.revenue_deduction)
        : (row.revenue_deduction as number),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Maps an array of database rows to User models
 */
export function mapUserRows(rows: DbRow[]): User[] {
  return (rows || []).map(mapUserRow);
}

/**
 * Maps an array of database rows to Professional models
 */
export function mapProfessionalRows(rows: DbRow[]): Professional[] {
  return (rows || []).map(mapProfessionalRow);
}

/**
 * Maps an array of database rows to VacationPeriod models
 */
export function mapVacationRows(rows: DbRow[]): VacationPeriod[] {
  return (rows || []).map(mapVacationRow);
}

/**
 * Maps User model to database row
 */
export function mapUserToDb(user: Partial<User>): DbRow {
  const row: DbRow = {};
  if (user.id !== undefined) row.id = user.id;
  if (user.email !== undefined) row.email = user.email;
  if (user.name !== undefined) row.name = user.name;
  if (user.password !== undefined) row.password = user.password;
  return row;
}

/**
 * Maps Professional model to database row
 */
export function mapProfessionalToDb(professional: Partial<Professional>): DbRow {
  const row: DbRow = {};
  if (professional.id !== undefined) row.id = professional.id;
  if (professional.userId !== undefined) row.user_id = professional.userId;
  if (professional.name !== undefined) row.name = professional.name;
  if (professional.clientManager !== undefined) row.client_manager = professional.clientManager;
  if (professional.monthlyRevenue !== undefined) row.monthly_revenue = professional.monthlyRevenue;
  return row;
}

/**
 * Maps VacationPeriod model to database row
 */
export function mapVacationToDb(vacation: Partial<VacationPeriod>): DbRow {
  const row: DbRow = {};
  if (vacation.id !== undefined) row.id = vacation.id;
  if (vacation.professionalId !== undefined) row.professional_id = vacation.professionalId;
  if (vacation.userId !== undefined) row.user_id = vacation.userId;
  if (vacation.acquisitionStartDate !== undefined)
    row.acquisition_start_date = vacation.acquisitionStartDate;
  if (vacation.acquisitionEndDate !== undefined)
    row.acquisition_end_date = vacation.acquisitionEndDate;
  if (vacation.usageStartDate !== undefined) row.usage_start_date = vacation.usageStartDate;
  if (vacation.usageEndDate !== undefined) row.usage_end_date = vacation.usageEndDate;
  if (vacation.totalDays !== undefined) row.total_days = vacation.totalDays;
  if (vacation.revenueDeduction !== undefined) row.revenue_deduction = vacation.revenueDeduction;
  return row;
}
