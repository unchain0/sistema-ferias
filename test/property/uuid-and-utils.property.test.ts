import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as fc from 'fast-check';

import {
  calculateRevenueDeduction,
  calculateVacationDays,
  cn,
} from '../../lib/utils.ts';
import { uuidv7 } from '../../lib/uuid-v7.ts';
import { secureCompare } from '../../lib/input-validation.ts';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('property tests', () => {
  it('uuidv7 always yields version 7 variant RFC4122 ids', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 48 - 1 }), (ts) => {
        assert.match(uuidv7(ts), UUID_V7);
      }),
      { numRuns: 100 }
    );
  });

  it('calculateVacationDays is at least 1 for ordered ISO dates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 40 }),
        fc.integer({ min: 0, max: 40 }),
        (startOffset, span) => {
          const start = new Date(Date.UTC(2024, 0, 1 + startOffset));
          const end = new Date(start);
          end.setUTCDate(end.getUTCDate() + span);
          const toIso = (d: Date) => d.toISOString().slice(0, 10);
          const days = calculateVacationDays(toIso(start), toIso(end));
          assert.equal(days, span + 1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('calculateRevenueDeduction scales linearly with days', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1_000_000, noNaN: true }),
        fc.integer({ min: 0, max: 30 }),
        (revenue, days) => {
          const value = calculateRevenueDeduction(revenue, days);
          assert.ok(Number.isFinite(value));
          assert.ok(Math.abs(value - (revenue / 30) * days) < 1e-6);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('cn joins only truthy class names', () => {
    fc.assert(
      fc.property(
        fc.array(fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: null }), {
          maxLength: 6,
        }),
        (parts) => {
          const mapped = parts.map((p) => (p === null ? false : p));
          const result = cn(...mapped);
          const expected = mapped.filter(Boolean).join(' ');
          assert.equal(result, expected);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('secureCompare is reflexive and rejects unequal strings', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 32 }), (s) => {
        assert.equal(secureCompare(s, s), true);
      }),
      { numRuns: 40 }
    );

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }),
        fc.string({ minLength: 1, maxLength: 16 }),
        (a, b) => {
          if (a === b) {
            assert.equal(secureCompare(a, b), true);
          } else {
            assert.equal(secureCompare(a, b), false);
          }
        }
      ),
      { numRuns: 40 }
    );
  });
});
