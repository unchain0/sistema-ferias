import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Regression for production init-demo 500 when Supabase is unreachable.
 * Vercel runtime log (read-only):
 *   Error initializing demo data: { message: 'TypeError: fetch failed', ... }
 * Host zrmlzgkczgqwjpnzomgh.supabase.co does not resolve (project gone).
 * Dead NEXT_PUBLIC_SUPABASE_* must not block the seed-backed demo path.
 */

describe('init-demo storage fallback', () => {
  it('isStorageUnavailable detects the production fetch-failed shape', async () => {
    const { isStorageUnavailable } = await import('../lib/storage-errors.ts');
    assert.equal(
      isStorageUnavailable({
        message: 'TypeError: fetch failed',
        details: 'TypeError: fetch failed',
        hint: '',
        code: '',
      }),
      true
    );
    assert.equal(isStorageUnavailable(new TypeError('fetch failed')), true);
    assert.equal(isStorageUnavailable(new Error('duplicate key value')), false);
  });

  it('demo seed IDs are unique and user id is UUIDv7', async () => {
    const seed = await import('../lib/seed-demo.ts');
    const snapshot = await seed.getDemoSnapshot();
    seed.assertUniqueSeedIds(snapshot);
    assert.equal(snapshot.user.email, seed.DEMO_EMAIL);
    assert.equal(snapshot.user.id, seed.DEMO_USER_ID);
    assert.match(
      snapshot.user.id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    assert.ok(snapshot.professionals.length > 0);
    assert.ok(snapshot.vacations.length > 0);
  });

  it('POST /api/auth/init-demo returns 200 with storage=seed when Supabase fetch fails', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      'https://this-project-does-not-exist-xyz.supabase.co';
    // Non-empty placeholders only (not real credentials; avoid JWT-shaped fixtures).
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-not-a-credential';
    process.env.SUPABASE_JWT_SECRET = 'test-jwt-secret-not-a-credential';
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-not-a-credential';
    process.env.VERCEL = '1';

    // Isolate module graph so hasSupabaseEnv() sees the dead URL.
    const suffix = `?fallback=${Date.now()}`;
    const routeModule = await import(`../app/api/auth/init-demo/route.ts${suffix}`);
    const { POST } = routeModule as { POST: () => Promise<Response> };

    const response = await POST();
    assert.equal(response.status, 200, `expected 200 from init-demo, got ${response.status}`);
    const body = (await response.json()) as {
      error?: string;
      email?: string;
      storage?: string;
      totalProfessionals?: number;
      totalVacations?: number;
    };
    assert.equal(body.error, undefined, `body=${JSON.stringify(body)}`);
    assert.equal(body.email, 'demo@sistema-ferias.com');
    assert.ok(
      body.storage === 'seed' || body.storage === 'persisted',
      `unexpected storage=${body.storage}`
    );
    assert.ok((body.totalProfessionals ?? 0) >= 1);
    assert.ok((body.totalVacations ?? 0) >= 1);
  });

  it('authenticateUser accepts demo credentials without reachable Supabase', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      'https://this-project-does-not-exist-xyz.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-not-a-credential';
    process.env.SUPABASE_JWT_SECRET = 'test-jwt-secret-not-a-credential';
    process.env.VERCEL = '1';

    const suffix = `?auth=${Date.now()}`;
    const authenticationModule = await import(`../lib/auth.ts${suffix}`);
    const { authenticateUser } = authenticationModule as { authenticateUser: (email: string, password: string) => Promise<{ email: string; id: string } | null> };
    const seedModule = await import(`../lib/seed-demo.ts${suffix}`);
    const { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } = seedModule as { DEMO_EMAIL: string; DEMO_PASSWORD: string; DEMO_USER_ID: string };

    const user = await authenticateUser(DEMO_EMAIL, DEMO_PASSWORD);
    assert.ok(user, 'demo user should authenticate from seed');
    if (user !== null) {
      assert.equal(user.email, DEMO_EMAIL);
      assert.equal(user.id, DEMO_USER_ID);
    }

    const denied = await authenticateUser(DEMO_EMAIL, 'wrong-password');
    assert.equal(denied, null);
  });
});