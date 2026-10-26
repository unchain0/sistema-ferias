import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { securityHeaders } from '../lib/security-headers.ts';

describe('securityHeaders', () => {
  it('includes HSTS, frame options, and CSP', () => {
    const keys = securityHeaders.map((h) => h.key);
    assert.ok(keys.includes('Strict-Transport-Security'));
    assert.ok(keys.includes('X-Frame-Options'));
    assert.ok(keys.includes('Content-Security-Policy'));

    const csp = securityHeaders.find((h) => h.key === 'Content-Security-Policy');
    assert.ok(csp !== undefined);
    assert.match(csp?.value ?? '', /default-src 'self'/);
  });
});
