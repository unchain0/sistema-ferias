import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonRequest } from '@/tests/helpers/next';

describe('Professionals API routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('GET /api/professionals returns 401 when not authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => null),
    }));

    vi.doMock('@/lib/db', () => ({
      getProfessionals: vi.fn(),
      createProfessional: vi.fn(),
    }));

    const { GET } = await import('@/app/api/professionals/route');
    const res = await GET(new Request('http://localhost/api/professionals'));
    expect(res.status).toBe(401);
  });

  it('POST /api/professionals validates required fields', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    vi.doMock('@/lib/demo-protection', () => ({
      isDemoUser: vi.fn(() => false),
      createDemoProtectionResponse: vi.fn(),
    }));

    vi.doMock('@/lib/db', () => ({
      getProfessionals: vi.fn(),
      createProfessional: vi.fn(),
    }));

    const { POST } = await import('@/app/api/professionals/route');
    const res = await POST(
      jsonRequest('http://localhost/api/professionals', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(400);
  });

  it('POST /api/professionals creates professional', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    vi.doMock('@/lib/demo-protection', () => ({
      isDemoUser: vi.fn(() => false),
      createDemoProtectionResponse: vi.fn(),
    }));

    const createProfessional = vi.fn(async () => ({
      id: 'p1',
      userId: 'u1',
      name: 'Alice',
      clientManager: 'Bob',
      monthlyRevenue: 123,
      createdAt: '2026-01-01',
    }));

    vi.doMock('@/lib/db', () => ({
      getProfessionals: vi.fn(),
      createProfessional,
    }));

    const { POST } = await import('@/app/api/professionals/route');
    const res = await POST(
      jsonRequest('http://localhost/api/professionals', {
        method: 'POST',
        body: JSON.stringify({ name: 'Alice', clientManager: 'Bob', monthlyRevenue: '123' }),
      }),
    );

    expect(res.status).toBe(201);
    expect(createProfessional).toHaveBeenCalled();
  });
});
