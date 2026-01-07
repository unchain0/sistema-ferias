import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClientIdentifier, rateLimit } from '@/lib/rate-limit';

describe('lib/rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getClientIdentifier', () => {
    it('uses first x-forwarded-for entry', () => {
      const req = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '1.1.1.1, 2.2.2.2',
        },
      });
      expect(getClientIdentifier(req)).toBe('1.1.1.1');
    });

    it('uses x-real-ip when forwarded absent', () => {
      const req = new Request('http://localhost', {
        headers: {
          'x-real-ip': '3.3.3.3',
        },
      });
      expect(getClientIdentifier(req)).toBe('3.3.3.3');
    });

    it('falls back to unknown', () => {
      const req = new Request('http://localhost');
      expect(getClientIdentifier(req)).toBe('unknown');
    });
  });

  describe('rateLimit', () => {
    it('allows up to maxRequests within interval', () => {
      const config = { interval: 1000, maxRequests: 2 };

      expect(rateLimit('id', config)).toBe(true);
      expect(rateLimit('id', config)).toBe(true);
      expect(rateLimit('id', config)).toBe(false);
    });

    it('resets after interval', () => {
      const config = { interval: 1000, maxRequests: 1 };

      expect(rateLimit('id2', config)).toBe(true);
      expect(rateLimit('id2', config)).toBe(false);

      vi.advanceTimersByTime(1001);
      expect(rateLimit('id2', config)).toBe(true);
    });
  });
});
