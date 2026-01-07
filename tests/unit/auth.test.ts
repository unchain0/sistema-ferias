import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

describe('lib/auth', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const bcrypt = await import('bcryptjs');
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password_here');
    (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  describe('hashPassword', () => {
    it('throws when password is empty', async () => {
      const { hashPassword } = await import('@/lib/auth');

      await expect(hashPassword('')).rejects.toThrow('Failed to hash password');
    });

    it('hashes with cost 12', async () => {
      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        'hashed_password_here',
      );

      const { hashPassword } = await import('@/lib/auth');
      const res = await hashPassword('abc123');

      expect(res).toBe('hashed_password_here');
      expect(bcrypt.hash).toHaveBeenCalledWith('abc123', 12);
    });

    it('truncates to 72 bytes for utf-8 input', async () => {
      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        'hashed_password_here',
      );

      const { hashPassword } = await import('@/lib/auth');

      const password = 'a'.repeat(71) + 'é'; // 71 bytes + 2 bytes
      await hashPassword(password);

      // Should only hash 71 ascii chars, because adding 'é' would exceed 72 bytes
      expect(bcrypt.hash).toHaveBeenCalledWith('a'.repeat(71), 12);
    });

    it('throws when bcrypt returns invalid hash', async () => {
      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('short');

      const { hashPassword } = await import('@/lib/auth');

      await expect(hashPassword('abc123')).rejects.toThrow('Failed to hash password');
    });
  });

  describe('verifyPassword', () => {
    it('returns false for invalid formats', async () => {
      const { verifyPassword } = await import('@/lib/auth');

      expect(await verifyPassword('', 'hash')).toBe(false);
      expect(await verifyPassword('pass', '')).toBe(false);
      expect(await verifyPassword('pass', 'not_bcrypt_hash')).toBe(false);
    });

    it('returns false when password exceeds max length', async () => {
      const { verifyPassword } = await import('@/lib/auth');
      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      expect(await verifyPassword('a'.repeat(73), bcryptHash)).toBe(false);
    });

    it('calls bcrypt compare for valid inputs', async () => {
      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { verifyPassword } = await import('@/lib/auth');
      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      const res = await verifyPassword('abc123', bcryptHash);

      expect(res).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('abc123', bcryptHash);
    });

    it('returns false when bcrypt compare throws', async () => {
      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

      const { verifyPassword } = await import('@/lib/auth');
      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      expect(await verifyPassword('abc123', bcryptHash)).toBe(false);
    });
  });

  describe('authenticateUser', () => {
    it('returns null for invalid inputs', async () => {
      const { authenticateUser } = await import('@/lib/auth');

      expect(await authenticateUser('', 'pass')).toBeNull();
      expect(await authenticateUser('a@a.com', '')).toBeNull();
      expect(await authenticateUser('a@a.com', 'a'.repeat(73))).toBeNull();
    });

    it('simulates comparison when user not found', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const bcrypt = await import('bcryptjs');
      const { authenticateUser } = await import('@/lib/auth');

      const res = await authenticateUser('missing@a.com', '123456');

      expect(res).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it('returns null when password check fails', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'A',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq',
      });

      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { authenticateUser } = await import('@/lib/auth');

      expect(await authenticateUser('a@a.com', 'abc123')).toBeNull();
    });

    it('returns user when password check succeeds', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'A',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq',
      });

      const bcrypt = await import('bcryptjs');
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { authenticateUser } = await import('@/lib/auth');

      const res = await authenticateUser('A@A.COM ', 'abc123');
      expect(res?.id).toBe('u1');
      expect(db.getUserByEmail).toHaveBeenCalledWith('a@a.com');
    });

    it('returns null when getUserByEmail throws', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('db down'),
      );

      const { authenticateUser } = await import('@/lib/auth');

      expect(await authenticateUser('a@a.com', 'abc123')).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('returns null for invalid password length', async () => {
      const { registerUser } = await import('@/lib/auth');

      expect(await registerUser('a@a.com', '12345', 'User')).toBeNull();
      expect(await registerUser('a@a.com', 'a'.repeat(73), 'User')).toBeNull();
    });

    it('returns null if user already exists', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'u1' });

      const { registerUser } = await import('@/lib/auth');

      expect(await registerUser('a@a.com', '123456', 'User')).toBeNull();
    });

    it('returns null if createUser returns null', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (db.createUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        'hashed_password_here',
      );

      const { registerUser } = await import('@/lib/auth');

      expect(await registerUser('A@A.COM ', '123456', ' User ')).toBeNull();
      expect(db.createUser).toHaveBeenCalledWith({
        email: 'a@a.com',
        password: 'hashed_password_here',
        name: 'User',
      });
    });

    it('returns user on success', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (db.createUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'u1' });

      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        'hashed_password_here',
      );

      const { registerUser } = await import('@/lib/auth');

      const user = await registerUser('A@A.COM ', '123456', ' User ');
      expect(user?.id).toBe('u1');
    });

    it('returns null when hashing throws', async () => {
      const db = await import('@/lib/db');
      (db.getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const bcrypt = await import('bcryptjs');
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

      const { registerUser } = await import('@/lib/auth');

      expect(await registerUser('a@a.com', '123456', 'User')).toBeNull();
    });
  });
});
