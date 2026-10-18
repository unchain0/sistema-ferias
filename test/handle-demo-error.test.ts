import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleDemoError } from '../lib/handle-demo-error.ts';

describe('handleDemoError', () => {
  it('returns demo message only for 403 demo responses', () => {
    const demo = handleDemoError(
      new Response(null, { status: 403 }),
      { demo: true }
    );
    assert.ok(demo !== null);
    assert.match(demo ?? '', /demonstração/i);

    assert.equal(
      handleDemoError(new Response(null, { status: 403 }), { demo: false }),
      null
    );
    assert.equal(
      handleDemoError(new Response(null, { status: 500 }), { demo: true }),
      null
    );
    assert.equal(handleDemoError(new Response(null, { status: 200 }), {}), null);
  });
});
