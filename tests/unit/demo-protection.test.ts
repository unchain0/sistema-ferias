import { describe, expect, it } from 'vitest';

import { createDemoProtectionResponse, isDemoUser } from '@/lib/demo-protection';

describe('lib/demo-protection', () => {
  it('isDemoUser matches demo email only', () => {
    expect(isDemoUser('demo@sistema-ferias.com')).toBe(true);
    expect(isDemoUser('other@sistema-ferias.com')).toBe(false);
    expect(isDemoUser(undefined)).toBe(false);
    expect(isDemoUser(null)).toBe(false);
  });

  it('createDemoProtectionResponse returns 403 with demo flag', async () => {
    const res = createDemoProtectionResponse();
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.demo).toBe(true);
  });
});
