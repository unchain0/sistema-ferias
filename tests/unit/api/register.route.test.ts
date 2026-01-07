import { describe, expect, it, vi, beforeEach } from 'vitest'
import { jsonRequest } from '@/tests/helpers/next'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns 400 when missing fields', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }))

    vi.doMock('@/lib/auth', () => ({
      registerUser: vi.fn(),
    }))

    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(jsonRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    const createRateLimitResponse = vi.fn(() => new Response('rate limited', { status: 429 }))

    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => false),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse,
    }))

    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(jsonRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: 'User' }),
    }))

    expect(res.status).toBe(429)
  })
})
