import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => null),
    }))

    vi.doMock('@/lib/db', () => ({
      getProfessionals: vi.fn(),
      getVacationPeriods: vi.fn(),
    }))

    const { GET } = await import('@/app/api/dashboard/route')
    const res = await GET(new Request('http://localhost/api/dashboard'))

    expect(res.status).toBe(401)
  })

  it('returns aggregated dashboard data', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }))

    vi.doMock('@/lib/db', () => ({
      getProfessionals: vi.fn(async () => [
        {
          id: 'p1',
          userId: 'u1',
          name: 'Alice',
          clientManager: 'Bob',
          monthlyRevenue: 15000,
          createdAt: '2025-01-01',
        },
      ]),
      getVacationPeriods: vi.fn(async () => [
        {
          id: 'v1',
          professionalId: 'p1',
          userId: 'u1',
          acquisitionStartDate: '2024-01-01',
          acquisitionEndDate: '2024-12-31',
          usageStartDate: '2026-01-05',
          usageEndDate: '2026-01-09',
          totalDays: 5,
          revenueDeduction: 2500,
          createdAt: '2026-01-01',
        },
      ]),
    }))

    const { GET } = await import('@/app/api/dashboard/route')
    const res = await GET(new Request('http://localhost/api/dashboard?startDate=2026-01-01&endDate=2026-01-31'))

    expect(res.status).toBe(200)
    const json = await res.json()

    expect(json.totalProfessionals).toBe(1)
    expect(json.totalVacationDays).toBe(5)
    expect(json.totalRevenueImpact).toBe(2500)
    expect(json.vacationsByMonth).toHaveLength(1)
    expect(json.professionalImpacts[0].professionalName).toBe('Alice')
  })
})
