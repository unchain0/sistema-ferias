import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createRateLimitResponse,
  getClientIdentifier,
  pruneExpiredRateLimits,
  rateLimit,
} from '../lib/rate-limit.ts';

describe('rate-limit', () => {
  it('allows traffic under the cap and blocks when exceeded', () => {
    const id = `client-${Date.now()}-${process.hrtime.bigint()}`;
    const config = { interval: 60_000, maxRequests: 2 };
    assert.equal(rateLimit(id, config), true);
    assert.equal(rateLimit(id, config), true);
    assert.equal(rateLimit(id, config), false);
  });

  it('resets the window after interval elapses', () => {
    const id = `reset-${Date.now()}`;
    const config = { interval: 1, maxRequests: 1 };
    assert.equal(rateLimit(id, config), true);
    const start = Date.now();
    while (Date.now() - start < 5) {
      // wait for window to expire
    }
    assert.equal(rateLimit(id, config), true);
  });

  it('createRateLimitResponse sets status and optional Retry-After', async () => {
    const plain = createRateLimitResponse();
    assert.equal(plain.status, 429);
    assert.equal(plain.headers.get('X-RateLimit-Limit'), '100');

    const withRetry = createRateLimitResponse(2500);
    assert.equal(withRetry.headers.get('Retry-After'), '3');
    const body = (await withRetry.json()) as { error: string };
    assert.match(body.error, /requisições/i);
  });

  it('pruneExpiredRateLimits drops stale windows', () => {
    const id = `prune-${Date.now()}`;
    assert.equal(rateLimit(id, { interval: 1, maxRequests: 5 }), true);
    pruneExpiredRateLimits(Date.now() + 1000);
    assert.equal(rateLimit(id, { interval: 60_000, maxRequests: 1 }), true);
  });

  it('getClientIdentifier prefers forwarded headers', () => {
    const forwarded = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    assert.equal(getClientIdentifier(forwarded), '1.2.3.4');

    const realIp = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    assert.equal(getClientIdentifier(realIp), '9.9.9.9');

    const unknown = new Request('http://localhost');
    assert.equal(getClientIdentifier(unknown), 'unknown');
  });
});
