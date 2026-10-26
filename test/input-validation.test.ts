import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { describe, it } from 'node:test';
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
} from '../lib/input-validation.ts';

describe('input-validation', () => {
  it('sanitizeString strips tags, trims, and caps length', () => {
    assert.equal(sanitizeString(''), '');
    assert.equal(sanitizeString('  hello <script>  '), 'hello script');
    assert.equal(sanitizeString('x'.repeat(600)).length, 500);
  });

  it('schemas accept valid and reject invalid payloads', () => {
    assert.equal(emailSchema.safeParse('a@b.com').success, true);
    assert.equal(emailSchema.safeParse('bad').success, false);
    assert.equal(passwordSchema.safeParse(randomBytes(12).toString('base64url')).success, true);
    assert.equal(passwordSchema.safeParse('123').success, false);
    assert.equal(nameSchema.safeParse('Ana').success, true);
    assert.equal(nameSchema.safeParse('A').success, false);

    const professional = professionalSchema.safeParse({
      name: 'João',
      clientManager: 'Maria',
      monthlyRevenue: 10_000,
    });
    assert.equal(professional.success, true);

    const vacation = vacationSchema.safeParse({
      professionalId: '01941f29-7c00-7e43-b999-cafa1b9c8ee9',
      acquisitionStartDate: '2024-01-01',
      acquisitionEndDate: '2024-12-31',
      usageStartDate: '2025-01-01',
      usageEndDate: '2025-01-30',
    });
    assert.equal(vacation.success, true);
    assert.equal(
      vacationSchema.safeParse({ professionalId: 'not-uuid' }).success,
      false
    );
  });

  it('validateInput returns typed data or joined zod messages', () => {
    const schema = z.object({ n: z.number().positive() });
    const ok = validateInput(schema, { n: 3 });
    assert.equal(ok.success, true);
    if (ok.success) assert.equal(ok.data.n, 3);

    const bad = validateInput(schema, { n: -1 });
    assert.equal(bad.success, false);
    if (!bad.success) assert.ok(bad.error.length > 0);

    const boom = validateInput(
      {
        parse() {
          throw new Error('not zod');
        },
      } as unknown as z.ZodSchema<unknown>,
      {}
    );
    assert.equal(boom.success, false);
    if (!boom.success) assert.equal(boom.error, 'Erro de validação');
  });

  it('secureCompare is length-sensitive and constant-time for equal lengths', () => {
    assert.equal(secureCompare('abc', 'abc'), true);
    assert.equal(secureCompare('abc', 'abd'), false);
    assert.equal(secureCompare('abc', 'ab'), false);
  });
});
