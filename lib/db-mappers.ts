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
