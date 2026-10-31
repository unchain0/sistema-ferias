import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emailSchema, validateInput } from '../lib/input-validation';

describe('validateInput Zod 4 errors', () => {
  it('joins issue messages when parse fails', () => {
    const result = validateInput(emailSchema, 'not-an-email');
    assert.equal(result.success, false);
    assert.ok(result.error && result.error.length > 0);
    assert.equal(result.data, undefined);
  });

  it('returns parsed data when valid', () => {
    const result = validateInput(emailSchema, 'ok@example.com');
    assert.equal(result.success, true);
    assert.equal(result.data, 'ok@example.com');
  });
});
