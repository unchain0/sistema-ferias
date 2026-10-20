import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createDemoProtectionResponse,
  isDemoUser,
} from '../lib/demo-protection.ts';

describe('demo-protection', () => {
  it('isDemoUser matches the seeded demo email only', () => {
    assert.equal(isDemoUser('demo@sistema-ferias.com'), true);
    assert.equal(isDemoUser(' DEMO@sistema-ferias.com '), true);
    assert.equal(isDemoUser('other@example.com'), false);
    assert.equal(isDemoUser(null), false);
    assert.equal(isDemoUser(undefined), false);
  });

  it('createDemoProtectionResponse returns 403 demo payload', async () => {
    const response = createDemoProtectionResponse();
    assert.equal(response.status, 403);
    const body = (await response.json()) as { error: string; demo: boolean };
    assert.equal(body.demo, true);
    assert.match(body.error, /demonstração/i);
  });
});
