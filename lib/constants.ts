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

// Cache TTL defaults (in seconds)
export const CACHE_TTL = {
  PRIVATE_DATA: 5, // 5 seconds for user-specific data
  PUBLIC_DATA: 60, // 1 minute for public data
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
