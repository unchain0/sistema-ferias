import { z } from 'zod';

// Sanitize string inputs to prevent XSS
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .substring(0, 500); // Limit length
}

// Email validation
export const emailSchema = z.string().email().max(255);

// Password validation (72 chars = max para bcrypt no pgcrypto)
export const passwordSchema = z.string().min(6).max(72);

// Name validation
export const nameSchema = z.string().min(2).max(100);

// Professional validation
export const professionalSchema = z.object({
  name: z.string().min(2).max(100),
  clientManager: z.string().min(2).max(100),
  monthlyRevenue: z.number().positive().max(1000000),
});

// Vacation validation
export const vacationSchema = z.object({
  professionalId: z.string().uuid(),
  acquisitionStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  acquisitionEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  usageStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  usageEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Generic validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      };
    }
    return {
      success: false,
      error: 'Erro de validação'
    };
  }
}

// Prevent timing attacks on string comparison
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
