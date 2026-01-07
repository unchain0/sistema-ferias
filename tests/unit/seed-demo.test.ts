import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
}))

describe('createDemoData', () => {
  it('should create demo user, professionals and vacations', async () => {
    const { createDemoData } = await import('@/lib/seed-demo')

    const demoData = await createDemoData()

    expect(demoData.user.email).toBe('demo@sistema-ferias.com')
    expect(demoData.user.password).toBe('hashed:demo123')

    expect(demoData.professionals.length).toBeGreaterThanOrEqual(12)
    expect(demoData.vacations.length).toBeGreaterThanOrEqual(
      demoData.professionals.length
    )

    // Relationships should reference existing professional ids
    const professionalIds = new Set(demoData.professionals.map((p) => p.id))
    for (const v of demoData.vacations.slice(0, 20)) {
      expect(professionalIds.has(v.professionalId)).toBe(true)
    }
  })
})
