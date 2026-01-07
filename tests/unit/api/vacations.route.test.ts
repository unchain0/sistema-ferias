import { describe, expect, it, vi, beforeEach } from 'vitest'
import { jsonRequest } from '@/tests/helpers/next'

describe('Vacations API routes', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('GET /api/vacations returns 401 when not authenticated', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => null),
    }))

    vi.doMock('@/lib/db', () => ({
      getVacationPeriods: vi.fn(),
    }))

    const { GET } = await import('@/app/api/vacations/route')
    const res = await GET(new Request('http://localhost/api/vacations'))
    expect(res.status).toBe(401)
  })

  it('GET /api/vacations paginates and sets headers', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }))

    vi.doMock('@/lib/db', () => ({
      getVacationPeriods: vi.fn(async () => [
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
      ]),
    }))

    const { GET } = await import('@/app/api/vacations/route')
    const res = await GET(new Request('http://localhost/api/vacations?limit=1&offset=0&order=createdAt:asc'))

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Total-Count')).toBe('2')

    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe('v1')
  })

  it('POST /api/vacations returns 404 if professional not found', async () => {
    vi.doMock('next-auth', () => ({
      getServerSession: vi.fn(async () => ({ user: { id: 'u1', email: 'u1@test.com' } })),
    }))

    vi.doMock('@/lib/demo-protection', () => ({
      isDemoUser: vi.fn(() => false),
      createDemoProtectionResponse: vi.fn(),
    }))

    vi.doMock('@/lib/db', () => ({
      getVacationPeriods: vi.fn(),
      getProfessionalById: vi.fn(async () => null),
      createVacationPeriod: vi.fn(),
    }))

    const { POST } = await import('@/app/api/vacations/route')
    const res = await POST(jsonRequest('http://localhost/api/vacations', {
      method: 'POST',
      body: JSON.stringify({
        professionalId: 'p1',
        acquisitionStartDate: '2024-01-01',
        acquisitionEndDate: '2024-12-31',
        usageStartDate: '2026-01-01',
        usageEndDate: '2026-01-05',
      }),
    }))

    expect(res.status).toBe(404)
  })
})
