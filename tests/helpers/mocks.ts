import { vi } from 'vitest'

export function mockSession(user?: { id: string; email?: string }) {
  vi.doMock('next-auth', () => ({
    getServerSession: vi.fn(async () => (user ? { user } : null)),
  }))
}
