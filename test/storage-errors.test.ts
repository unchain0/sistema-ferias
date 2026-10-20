import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isStorageUnavailable } from '../lib/storage-errors.ts';

describe('isStorageUnavailable', () => {
  it('detects network failure shapes including nested causes', () => {
    assert.equal(isStorageUnavailable(null), false);
    assert.equal(isStorageUnavailable(undefined), false);
    assert.equal(isStorageUnavailable('fetch failed'), true);
    assert.equal(isStorageUnavailable(new TypeError('fetch failed')), true);
    assert.equal(isStorageUnavailable(new Error('duplicate key')), false);

    const nested = new Error('wrapper');
    (nested as Error & { cause?: unknown }).cause = new Error('ECONNREFUSED 127.0.0.1');
    assert.equal(isStorageUnavailable(nested), true);

    assert.equal(
      isStorageUnavailable({
        message: 'upstream',
        details: 'getaddrinfo ENOTFOUND example.invalid',
        code: 'ENOTFOUND',
      }),
      true
    );

    assert.equal(
      isStorageUnavailable({
        reason: 'Self-signed certificate in certificate chain',
      }),
      true
    );
  });
});
