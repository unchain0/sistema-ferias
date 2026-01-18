/**
 * Application constants
 * Centralized location for magic strings and configuration values
 */

// Demo user configuration
export const DEMO_USER_EMAIL = 'demo@sistema-ferias.com';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;
export const MIN_PAGE_SIZE = 1;

// Rate limiting defaults
export const RATE_LIMIT_REGISTER = {
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
};

export const RATE_LIMIT_LOGIN = {
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
};

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 72, // bcrypt limit
  MONTHLY_REVENUE_MAX: 1_000_000,
  STRING_MAX: 500,
};

// Valid order fields for vacations
export const VACATION_ORDER_FIELDS = [
  'id',
  'professionalId',
  'userId',
  'acquisitionStartDate',
  'acquisitionEndDate',
  'usageStartDate',
  'usageEndDate',
  'totalDays',
  'revenueDeduction',
  'createdAt',
  'updatedAt',
] as const;

export type VacationOrderField = (typeof VACATION_ORDER_FIELDS)[number];

// Valid order fields for professionals
export const PROFESSIONAL_ORDER_FIELDS = [
  'id',
  'name',
  'clientManager',
  'monthlyRevenue',
  'createdAt',
  'updatedAt',
] as const;

export type ProfessionalOrderField = (typeof PROFESSIONAL_ORDER_FIELDS)[number];

// Column name mapping from camelCase to snake_case for database queries
export const VACATION_COLUMN_MAP: Record<string, string> = {
  id: 'id',
  professionalId: 'professional_id',
  userId: 'user_id',
  acquisitionStartDate: 'acquisition_start_date',
  acquisitionEndDate: 'acquisition_end_date',
  usageStartDate: 'usage_start_date',
  usageEndDate: 'usage_end_date',
  totalDays: 'total_days',
  revenueDeduction: 'revenue_deduction',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const PROFESSIONAL_COLUMN_MAP: Record<string, string> = {
  id: 'id',
  userId: 'user_id',
  name: 'name',
  clientManager: 'client_manager',
  monthlyRevenue: 'monthly_revenue',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
