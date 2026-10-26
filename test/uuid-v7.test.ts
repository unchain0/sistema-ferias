import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { uuidv7 } from '../lib/uuid-v7.ts';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('uuidv7', () => {
  it('returns RFC 9562 version 7 identifiers', () => {
    const id = uuidv7();
    assert.match(id, UUID_V7);
    assert.match(uuidv7(Date.now()), UUID_V7);
  });

  it('embeds the provided millisecond timestamp', () => {
    const now = Date.UTC(2024, 0, 1, 0, 0, 0);
    const id = uuidv7(now);
    const hex = id.replaceAll('-', '');
    const ts = Number.parseInt(hex.slice(0, 12), 16);
    assert.equal(ts, now);
  });

  it('produces unique values across many draws', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      seen.add(uuidv7());
    }
    assert.equal(seen.size, 200);
  });
});
