import { calculateVacationDays, cn, convertISOToBR, formatCurrency } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('Utils', () => {
  describe('calculateVacationDays', () => {
    it('should calculate days between two dates inclusive', () => {
      const start = '2023-01-01'
      const end = '2023-01-10'
      expect(calculateVacationDays(start, end)).toBe(10)
    })
  })

  describe('formatCurrency', () => {
    it('should format number to BRL currency', () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s?1\.000,00/)
    })
  })

  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('c1', 'c2')).toBe('c1 c2')
      expect(cn('c1', { c2: true, c3: false })).toBe('c1 c2')
      expect(cn('p-4 p-2')).toBe('p-2') // Tailwind merge
    })
  })

  describe('convertISOToBR', () => {
    it('should convert ISO date to BR format', () => {
      expect(convertISOToBR('2023-12-25')).toBe('25/12/2023')
    })
    it('should return empty string for empty input', () => {
      expect(convertISOToBR('')).toBe('')
    })
  })
})
