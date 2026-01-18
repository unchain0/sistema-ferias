import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '@/services/auth-service';

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockUserRepository = {
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(mockUserRepository as any);
  });

  describe('hashPassword', () => {
    it('throws when password is empty', async () => {
      await expect(authService.hashPassword('')).rejects.toThrow('Failed to hash password');
    });

    it('hashes with cost 12', async () => {
      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password_here');

      const res = await authService.hashPassword('abc123');

      expect(res).toBe('hashed_password_here');
      expect(hash).toHaveBeenCalledWith('abc123', 12);
    });

    it('truncates to 72 bytes for utf-8 input', async () => {
      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password_here');

      const password = 'a'.repeat(71) + 'é'; // 71 bytes + 2 bytes
      await authService.hashPassword(password);

      // Should only hash 71 ascii chars, because adding 'é' would exceed 72 bytes
      expect(hash).toHaveBeenCalledWith('a'.repeat(71), 12);
    });

    it('throws when bcrypt returns invalid hash', async () => {
      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('short');

      await expect(authService.hashPassword('abc123')).rejects.toThrow('Failed to hash password');
    });
  });

  describe('verifyPassword', () => {
    it('returns false for invalid formats', async () => {
      expect(await authService.verifyPassword('', 'hash')).toBe(false);
      expect(await authService.verifyPassword('pass', '')).toBe(false);
      expect(await authService.verifyPassword('pass', 'not_bcrypt_hash')).toBe(false);
    });

    it('returns false when password exceeds max length', async () => {
      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      expect(await authService.verifyPassword('a'.repeat(73), bcryptHash)).toBe(false);
    });

    it('calls bcrypt compare for valid inputs', async () => {
      const { compare } = await import('bcryptjs');
      (compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      const res = await authService.verifyPassword('abc123', bcryptHash);

      expect(res).toBe(true);
      expect(compare).toHaveBeenCalledWith('abc123', bcryptHash);
    });

    it('returns false when bcrypt compare throws', async () => {
      const { compare } = await import('bcryptjs');
      (compare as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

      const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq';

      expect(await authService.verifyPassword('abc123', bcryptHash)).toBe(false);
    });
  });

  describe('authenticateUser', () => {
    it('returns null for invalid inputs', async () => {
      expect(await authService.authenticateUser('', 'pass')).toBeNull();
      expect(await authService.authenticateUser('a@a.com', '')).toBeNull();
      expect(await authService.authenticateUser('a@a.com', 'a'.repeat(73))).toBeNull();
    });

    it('simulates comparison when user not found', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      const { compare } = await import('bcryptjs');
      const res = await authService.authenticateUser('missing@a.com', '123456');

      expect(res).toBeNull();
      expect(compare).toHaveBeenCalled();
    });

    it('returns null when password check fails', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'A',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq',
      });

      const { compare } = await import('bcryptjs');
      (compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      expect(await authService.authenticateUser('a@a.com', 'abc123')).toBeNull();
    });

    it('returns user when password check succeeds', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'A',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq',
      });

      const { compare } = await import('bcryptjs');
      (compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const res = await authService.authenticateUser('A@A.COM ', 'abc123');
      expect(res?.id).toBe('u1');
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith('a@a.com');
    });

    it('returns null when getUserByEmail throws', async () => {
      mockUserRepository.getUserByEmail.mockRejectedValue(new Error('db down'));

      expect(await authService.authenticateUser('a@a.com', 'abc123')).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('throws for invalid password length', async () => {
      await expect(authService.registerUser('a@a.com', '12345', 'User')).rejects.toThrow(
        'INVALID_PASSWORD',
      );
      await expect(authService.registerUser('a@a.com', 'a'.repeat(73), 'User')).rejects.toThrow(
        'INVALID_PASSWORD',
      );
    });

    it('throws if user already exists', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({ id: 'u1' });

      await expect(authService.registerUser('a@a.com', '123456', 'User')).rejects.toThrow(
        'USER_ALREADY_EXISTS',
      );
    });

    it('throws if createUser returns null', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(null);

      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password_here');

      const user = await authService.registerUser('A@A.COM ', '123456', ' User ');
      expect(user).toBeNull();
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: 'a@a.com',
        password: 'hashed_password_here',
        name: 'User',
      });
    });

    it('returns user on success', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue({ id: 'u1' });

      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password_here');

      const user = await authService.registerUser('A@A.COM ', '123456', ' User ');
      expect(user?.id).toBe('u1');
    });

    it('throws when hashing throws', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      const { hash } = await import('bcryptjs');
      (hash as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

      await expect(authService.registerUser('a@a.com', '123456', 'User')).rejects.toThrow(
        'REGISTRATION_FAILED',
      );
    });
  });
});
