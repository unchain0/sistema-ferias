import { describe, expect, it } from 'vitest';

import {
  calculateRevenueDeduction,
  calculateVacationDays,
  cn,
  computeConcessivePeriod,
  formatCurrency,
  formatDateForInput,
  formatDateToPtBR,
} from '@/lib/utils';

describe('Utils', () => {
  describe('calculateVacationDays', () => {
    it('should calculate days between two dates inclusive', () => {
      const start = '2023-01-01';
      const end = '2023-01-10';
      expect(calculateVacationDays(start, end)).toBe(10);
    });
  });

  describe('calculateRevenueDeduction', () => {
    it('should calculate proportional deduction using 30-day month', () => {
      expect(calculateRevenueDeduction(3000, 10)).toBe(1000);
    });
  });

  describe('formatCurrency', () => {
    it('should format number to BRL currency', () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s?1\.000,00/);
    });
  });

  describe('formatDateToPtBR', () => {
    it('should format valid date to pt-BR', () => {
      const out = formatDateToPtBR('2025-01-15');
      expect(out).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should return input for invalid date', () => {
      expect(formatDateToPtBR('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatDateForInput', () => {
    it('should return empty string for nullish', () => {
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput(undefined)).toBe('');
    });

    it('should format Date object to yyyy-MM-dd', () => {
      expect(formatDateForInput(new Date('2025-01-06T10:00:00Z'))).toMatch(/^2025-01-0\d$/);
    });

    it('should convert Brazilian dd/mm/yyyy string to yyyy-MM-dd', () => {
      expect(formatDateForInput('06/01/2026')).toBe('2026-01-06');
    });

    it('should strip time from ISO datetime string', () => {
      expect(formatDateForInput('2026-01-06T12:34:56.000Z')).toBe('2026-01-06');
    });

    it('should return yyyy-MM-dd if already contains dashes', () => {
      expect(formatDateForInput('06-01-2026')).toBe('06-01-2026');
    });
  });

  describe('computeConcessivePeriod', () => {
    it('should compute a 12-month concessive period after acquisition end', () => {
      const concessive = computeConcessivePeriod('2024-01-01', '2024-12-31');
      expect(concessive).toEqual({ start: '2025-01-01', end: '2025-12-31' });
    });
  });

  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('c1', 'c2')).toBe('c1 c2');
      expect(cn('c1', { c2: true, c3: false })).toBe('c1 c2');
      expect(cn('p-4 p-2')).toBe('p-2'); // Tailwind merge
    });
  });
});
