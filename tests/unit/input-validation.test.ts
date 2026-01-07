import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  emailSchema,
  nameSchema,
  passwordSchema,
  professionalSchema,
  sanitizeString,
  secureCompare,
  vacationSchema,
  validateInput,
} from '@/lib/input-validation';

describe('lib/input-validation', () => {
  describe('sanitizeString', () => {
    it('trims, removes <>, and limits length', () => {
      const raw = '   <b>hello</b>   ';
      expect(sanitizeString(raw)).toBe('bhello/b');

      expect(sanitizeString('')).toBe('');

      const long = 'a'.repeat(600);
      expect(sanitizeString(long)).toHaveLength(500);
    });
  });

  describe('validateInput', () => {
    it('returns parsed data on success', () => {
      const schema = z.object({ a: z.string() });
      const res = validateInput(schema, { a: 'x' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ a: 'x' });
    });

    it('returns error string on ZodError', () => {
      const schema = z.object({ a: z.string().min(2) });
      const res = validateInput(schema, { a: 'x' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('String must contain at least 2');
    });

    it('returns generic error on unknown exceptions', () => {
      const schema = {
        parse() {
          throw new Error('boom');
        },
      } as unknown as z.ZodSchema<{ a: string }>;

      const res = validateInput(schema, { a: 'x' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Erro de validação');
    });
  });

  describe('secureCompare', () => {
    it('returns false when lengths differ', () => {
      expect(secureCompare('a', 'aa')).toBe(false);
    });

    it('returns true for equal strings', () => {
      expect(secureCompare('abc', 'abc')).toBe(true);
    });

    it('returns false for different strings same length', () => {
      expect(secureCompare('abc', 'axc')).toBe(false);
    });
  });

  describe('schemas', () => {
    it('validates email/password/name', () => {
      expect(emailSchema.safeParse('user@test.com').success).toBe(true);
      expect(emailSchema.safeParse('bad').success).toBe(false);

      expect(passwordSchema.safeParse('123456').success).toBe(true);
      expect(passwordSchema.safeParse('12345').success).toBe(false);

      expect(nameSchema.safeParse('AA').success).toBe(true);
      expect(nameSchema.safeParse('A').success).toBe(false);
    });

    it('validates professional and vacation objects', () => {
      expect(
        professionalSchema.safeParse({
          name: 'Alice',
          clientManager: 'Bob',
          monthlyRevenue: 100,
        }).success,
      ).toBe(true);

      expect(
        vacationSchema.safeParse({
          professionalId: 'not-uuid',
          acquisitionStartDate: '2024-01-01',
          acquisitionEndDate: '2024-12-31',
          usageStartDate: '2025-01-01',
          usageEndDate: '2025-01-10',
        }).success,
      ).toBe(false);
    });
  });
});
