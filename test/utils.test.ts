import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calculateRevenueDeduction,
  calculateVacationDays,
  cn,
  computeConcessivePeriod,
  convertISOToBR,
  formatCurrency,
  formatDateForInput,
  formatDateToPtBR,
} from '../lib/utils.ts';

describe('utils', () => {
  it('calculateVacationDays includes both endpoints', () => {
    assert.equal(calculateVacationDays('2024-01-01', '2024-01-01'), 1);
    assert.equal(calculateVacationDays('2024-01-01', '2024-01-10'), 10);
  });

  it('calculateRevenueDeduction uses 30-day month', () => {
    assert.equal(calculateRevenueDeduction(3000, 10), 1000);
    assert.equal(calculateRevenueDeduction(0, 5), 0);
  });

  it('formatCurrency returns BRL currency string', () => {
    const formatted = formatCurrency(1500.5);
    assert.match(formatted, /1\.500,50|R\$/);
  });

  it('formatDateToPtBR formats valid dates and keeps invalid input', () => {
    const formatted = formatDateToPtBR('2024-06-15');
    assert.match(formatted, /\d{2}\/\d{2}\/\d{4}/);
    assert.equal(formatDateToPtBR('not-a-date'), 'not-a-date');
  });

  it('formatDateForInput handles Date, BR, ISO, nullish, and unknown', () => {
    assert.equal(formatDateForInput(null), '');
    assert.equal(formatDateForInput(undefined), '');
    assert.equal(formatDateForInput(new Date(2024, 0, 5)), '2024-01-05');
    assert.equal(formatDateForInput('15/03/2024'), '2024-03-15');
    assert.equal(formatDateForInput('2024-03-15T12:00:00Z'), '2024-03-15');
    assert.equal(formatDateForInput('2024-03-15'), '2024-03-15');
    assert.equal(formatDateForInput('garbage'), '');
    assert.equal(formatDateForInput('1/2'), ''); // incomplete BR date
  });

  it('convertISOToBR converts ISO dates and empty input', () => {
    assert.equal(convertISOToBR(''), '');
    assert.equal(convertISOToBR('2024-03-15'), '15/03/2024');
    assert.equal(convertISOToBR('2024-03-15T10:00:00Z'), '15/03/2024');
    assert.equal(convertISOToBR('bad'), '');
  });

  it('cn joins truthy class names', () => {
    assert.equal(cn('a', false, null, undefined, 'b'), 'a b');
    assert.equal(cn(), '');
  });

  it('computeConcessivePeriod starts the day after acquisition ends', () => {
    const period = computeConcessivePeriod('2023-01-01', '2023-12-31');
    assert.equal(period.start, '2024-01-01');
    assert.equal(period.end, '2024-12-31');
  });
});
