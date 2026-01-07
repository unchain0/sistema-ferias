import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => null),
    }));

    vi.doMock('@/lib/di', () => ({
      dashboardService: {
        getDashboardData: vi.fn(),
      },
    }));

    const { GET } = await import('@/app/api/dashboard/route');
    const res = await GET(new Request('http://localhost/api/dashboard'));

    expect(res.status).toBe(401);
  });

  it('returns aggregated dashboard data', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }));

    vi.doMock('@/lib/di', () => ({
      dashboardService: {
        getDashboardData: vi.fn(async () => ({
          totalProfessionals: 1,
          totalVacationDays: 5,
          totalRevenueImpact: 2500,
          vacationsByMonth: [{ month: 'Jan', totalImpact: 2500, dayCount: 5 }],
          professionalImpacts: [{ professionalName: 'Alice', impact: 2500, days: 5 }],
          alerts: [],
          kpis: { avgImpactPerDay: 500, avgDaysPerProfessional: 5 },
          topProfessionals: [{ name: 'Alice', impact: 2500 }],
          periodSummary: { totalRevenue: 15000, totalImpact: 2500, impactPercentage: 16.67 },
        })),
      },
    }));

    const { GET } = await import('@/app/api/dashboard/route');
    const res = await GET(
      new Request('http://localhost/api/dashboard?startDate=2026-01-01&endDate=2026-01-31'),
    );

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.totalProfessionals).toBe(1);
    expect(json.totalVacationDays).toBe(5);
    expect(json.totalRevenueImpact).toBe(2500);
    expect(json.vacationsByMonth).toHaveLength(1);
    expect(json.professionalImpacts[0].professionalName).toBe('Alice');
  });
});
