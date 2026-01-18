import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonRequest } from '@/tests/helpers/next';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns 400 when missing fields', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      authService: {
        registerUser: vi.fn(),
      },
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      authService: {
        registerUser: vi.fn(),
      },
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'bad', password: 'Aa!23456', name: 'User' }),
      }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'Email inválido' });
  });

  it('returns 400 when password too short', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: '12345', name: 'User' }),
      }),
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when name invalid', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: 'A' }),
      }),
    );

    expect(res.status).toBe(400);
  });

  it('sanitizes name before calling registerUser', async () => {
    const registerUser = vi.fn(async () => ({ id: 'u1' }));

    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      authService: {
        registerUser,
      },
    }));

    const { POST } = await import('@/app/api/auth/register/route');

    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: '  <b>U</b>  ' }),
      }),
    );

    expect(res.status).toBe(201);
    expect(registerUser).toHaveBeenCalledWith('a@a.com', 'Aa!23456', 'bU/b');
  });

  it('returns 400 when email already registered', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      authService: {
        registerUser: vi.fn(async () => {
          throw new Error('USER_ALREADY_EXISTS');
        }),
      },
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: 'User' }),
      }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'Usuário ou email já cadastrados' });
  });

  it('returns 500 when registerUser throws', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => true),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse: vi.fn(),
    }));

    vi.doMock('@/lib/di', () => ({
      authService: {
        registerUser: vi.fn(async () => {
          throw new Error('boom');
        }),
      },
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: 'User' }),
      }),
    );

    expect(res.status).toBe(500);
  });

  it('returns 429 when rate limited', async () => {
    const createRateLimitResponse = vi.fn(() => new Response('rate limited', { status: 429 }));

    vi.doMock('@/lib/rate-limit', () => ({
      rateLimit: vi.fn(() => false),
      getClientIdentifier: vi.fn(() => 'ip'),
      createRateLimitResponse,
    }));

    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(
      jsonRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'Aa!23456', name: 'User' }),
      }),
    );

    expect(res.status).toBe(429);
  });
});
