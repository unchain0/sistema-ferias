import { timingSafeEqual } from 'crypto';
import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';

// Sanitize string inputs to prevent XSS
export function sanitizeString(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .substring(0, VALIDATION_LIMITS.STRING_MAX);
}

// UUID validation for route parameters
export const uuidSchema = z.string().uuid('ID inválido');

// Email validation
export const emailSchema = z.string().email().max(VALIDATION_LIMITS.EMAIL_MAX);

// Password validation
export const passwordSchema = z
  .string()
  .min(VALIDATION_LIMITS.PASSWORD_MIN)
  .max(VALIDATION_LIMITS.PASSWORD_MAX);

// Name validation
export const nameSchema = z
  .string()
  .min(VALIDATION_LIMITS.NAME_MIN)
  .max(VALIDATION_LIMITS.NAME_MAX);

// Professional validation for creation
export const professionalSchema = z.object({
  name: z.string().min(VALIDATION_LIMITS.NAME_MIN).max(VALIDATION_LIMITS.NAME_MAX),
  clientManager: z.string().min(VALIDATION_LIMITS.NAME_MIN).max(VALIDATION_LIMITS.NAME_MAX),
  monthlyRevenue: z.number().positive().max(VALIDATION_LIMITS.MONTHLY_REVENUE_MAX),
});

// Professional validation for updates (partial, allows undefined fields)
export const professionalUpdateSchema = z
  .object({
    name: z.string().min(VALIDATION_LIMITS.NAME_MIN).max(VALIDATION_LIMITS.NAME_MAX).optional(),
    clientManager: z
      .string()
      .min(VALIDATION_LIMITS.NAME_MIN)
      .max(VALIDATION_LIMITS.NAME_MAX)
      .optional(),
    monthlyRevenue: z.number().positive().max(VALIDATION_LIMITS.MONTHLY_REVENUE_MAX).optional(),
  })
  .refine((data) => data.name || data.clientManager || data.monthlyRevenue !== undefined, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

// Date string validation helper
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado: YYYY-MM-DD)');

// Vacation validation for creation
export const vacationSchema = z.object({
  professionalId: z.string().uuid(),
  acquisitionStartDate: dateStringSchema,
  acquisitionEndDate: dateStringSchema,
  usageStartDate: dateStringSchema,
  usageEndDate: dateStringSchema,
});

// Vacation validation for updates
export const vacationUpdateSchema = z.object({
  professionalId: z.string().uuid(),
  acquisitionStartDate: dateStringSchema,
  acquisitionEndDate: dateStringSchema,
  usageStartDate: dateStringSchema,
  usageEndDate: dateStringSchema,
});

// Generic validation helper
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return {
      success: false,
      error: 'Erro de validação',
    };
  }
}

// Prevent timing attacks on string comparison using Node.js crypto
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  // Pad shorter buffer to prevent timing leak from length comparison
  if (bufA.length !== bufB.length) {
    const maxLen = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.alloc(maxLen);
    const paddedB = Buffer.alloc(maxLen);
    bufA.copy(paddedA);
    bufB.copy(paddedB);
    timingSafeEqual(paddedA, paddedB);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
