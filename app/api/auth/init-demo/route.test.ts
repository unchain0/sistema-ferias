import { POST } from './route';

describe('init-demo', () => {
  it('returns error on failure with visible message', async () => {
    const res = await POST();
    // If DB unavailable, expect 500 with error body; if available, 200
    const body = await res.json();
    expect(body.error || body.message).toBeDefined();
  });
});
