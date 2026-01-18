import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonRequest } from '@/tests/helpers/next';

describe('Vacations API routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('GET /api/vacations returns 401 when not authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => null),
    }));

    vi.doMock('@/lib/di', () => ({
      vacationRepository: {
        getVacationPeriods: vi.fn(),
        getVacationPeriodsPaginated: vi.fn(),
      },
    }));

    const { GET } = await import('@/app/api/vacations/route');
    const res = await GET(new Request('http://localhost/api/vacations'));
    expect(res.status).toBe(401);
  });

  it('GET /api/vacations paginates and sets headers', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    const mockVacations = [
      {
        id: 'v1',
        professionalId: 'p1',
        userId: 'u1',
        acquisitionStartDate: '2024-01-01',
        acquisitionEndDate: '2024-12-31',
        usageStartDate: '2026-01-01',
        usageEndDate: '2026-01-05',
        totalDays: 5,
        revenueDeduction: 100,
        createdAt: '2026-01-01',
      },
      {
        id: 'v2',
        professionalId: 'p1',
        userId: 'u1',
        acquisitionStartDate: '2024-01-01',
        acquisitionEndDate: '2024-12-31',
        usageStartDate: '2026-02-01',
        usageEndDate: '2026-02-05',
        totalDays: 5,
        revenueDeduction: 100,
        createdAt: '2026-02-01',
      },
    ];

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        getVacations: vi.fn(async (_userId, options) => {
          // Simulate database-level pagination
          const limit = options?.limit || 50;
          const offset = options?.offset || 0;
          const paginatedData = mockVacations.slice(offset, offset + limit);
          return {
            data: paginatedData,
            total: mockVacations.length,
          };
        }),
      },
    }));

    const { GET } = await import('@/app/api/vacations/route');
    const res = await GET(
      new Request('http://localhost/api/vacations?limit=1&offset=0&order=createdAt:asc'),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Total-Count')).toBe('2');

    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('v1');
  });

  it('GET /api/vacations respects limit parameter for pagination', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    // Create 15 mock vacations to test pagination
    const mockVacations = Array.from({ length: 15 }, (_, i) => ({
      id: `v${i + 1}`,
      professionalId: 'p1',
      userId: 'u1',
      acquisitionStartDate: '2024-01-01',
      acquisitionEndDate: '2024-12-31',
      usageStartDate: `2026-0${(i % 9) + 1}-01`,
      usageEndDate: `2026-0${(i % 9) + 1}-05`,
      totalDays: 5,
      revenueDeduction: 100,
      createdAt: `2026-0${(i % 9) + 1}-01`,
    }));

    let capturedOptions: { limit?: number; offset?: number } | undefined;

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        getVacations: vi.fn(async (_userId, options) => {
          capturedOptions = options;
          const limit = options?.limit || 50;
          const offset = options?.offset || 0;
          const paginatedData = mockVacations.slice(offset, offset + limit);
          return {
            data: paginatedData,
            total: mockVacations.length,
          };
        }),
      },
    }));

    const { GET } = await import('@/app/api/vacations/route');

    // Test with limit=10 (as used by the frontend)
    const res = await GET(
      new Request('http://localhost/api/vacations?limit=10&offset=0&order=createdAt:desc'),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Total-Count')).toBe('15');

    const json = await res.json();
    // Should only return 10 items, not all 15
    expect(json).toHaveLength(10);
    expect(capturedOptions?.limit).toBe(10);
    expect(capturedOptions?.offset).toBe(0);
  });

  it('GET /api/vacations uses default limit when not specified', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    let capturedOptions: { limit?: number; offset?: number } | undefined;

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        getVacations: vi.fn(async (_userId, options) => {
          capturedOptions = options;
          return {
            data: [],
            total: 0,
          };
        }),
      },
    }));

    const { GET } = await import('@/app/api/vacations/route');

    // Test without limit parameter
    const res = await GET(new Request('http://localhost/api/vacations'));

    expect(res.status).toBe(200);
    // DEFAULT_PAGE_SIZE is 50
    expect(capturedOptions?.limit).toBe(50);
    expect(capturedOptions?.offset).toBe(0);
  });

  it('GET /api/vacations correctly handles offset for infinite scroll', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    const mockVacations = Array.from({ length: 25 }, (_, i) => ({
      id: `v${i + 1}`,
      professionalId: 'p1',
      userId: 'u1',
      acquisitionStartDate: '2024-01-01',
      acquisitionEndDate: '2024-12-31',
      usageStartDate: '2026-01-01',
      usageEndDate: '2026-01-05',
      totalDays: 5,
      revenueDeduction: 100,
      createdAt: `2026-01-${String(i + 1).padStart(2, '0')}`,
    }));

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        getVacations: vi.fn(async (_userId, options) => {
          const limit = options?.limit || 50;
          const offset = options?.offset || 0;
          const paginatedData = mockVacations.slice(offset, offset + limit);
          return {
            data: paginatedData,
            total: mockVacations.length,
          };
        }),
      },
    }));

    const { GET } = await import('@/app/api/vacations/route');

    // First page: offset=0, limit=10
    const res1 = await GET(
      new Request('http://localhost/api/vacations?limit=10&offset=0&order=createdAt:desc'),
    );
    const json1 = await res1.json();
    expect(json1).toHaveLength(10);
    expect(json1[0].id).toBe('v1');

    // Reset modules for clean mock state
    vi.resetModules();

    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        getVacations: vi.fn(async (_userId, options) => {
          const limit = options?.limit || 50;
          const offset = options?.offset || 0;
          const paginatedData = mockVacations.slice(offset, offset + limit);
          return {
            data: paginatedData,
            total: mockVacations.length,
          };
        }),
      },
    }));

    const { GET: GET2 } = await import('@/app/api/vacations/route');

    // Second page: offset=10, limit=10
    const res2 = await GET2(
      new Request('http://localhost/api/vacations?limit=10&offset=10&order=createdAt:desc'),
    );
    const json2 = await res2.json();
    expect(json2).toHaveLength(10);
    expect(json2[0].id).toBe('v11');
  });

  it('POST /api/vacations returns 404 if professional not found', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    vi.doMock('@/lib/demo-protection', () => ({
      isDemoUser: vi.fn(() => false),
      createDemoProtectionResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      vacationService: {
        createVacation: vi.fn(async () => {
          throw new Error('PROFESSIONAL_NOT_FOUND');
        }),
      },
    }));

    const { POST } = await import('@/app/api/vacations/route');
    const res = await POST(
      jsonRequest('http://localhost/api/vacations', {
        method: 'POST',
        body: JSON.stringify({
          professionalId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
          acquisitionStartDate: '2024-01-01',
          acquisitionEndDate: '2024-12-31',
          usageStartDate: '2026-01-01',
          usageEndDate: '2026-01-05',
        }),
      }),
    );

    expect(res.status).toBe(404);
  });
});
