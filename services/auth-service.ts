import { compare, hash } from 'bcryptjs';

import { IUserRepository } from '@/interfaces/repositories';
import { User } from '@/types';

const MAX_PASSWORD_LENGTH = 72;

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async hashPassword(password: string): Promise<string> {
    try {
      if (typeof password !== 'string' || password.length === 0) {
        throw new Error('Invalid password');
      }

      let passwordToHash = password;
      if (Buffer.byteLength(password, 'utf8') > 72) {
        let byteLength = 0;
        let charIndex = 0;
        while (charIndex < password.length && byteLength < 72) {
          const charBytes = Buffer.byteLength(password[charIndex], 'utf8');
          if (byteLength + charBytes > 72) break;
          byteLength += charBytes;
          charIndex++;
        }
        passwordToHash = password.substring(0, charIndex);
      }

      const hashed = await hash(passwordToHash, 12);

      if (typeof hashed !== 'string' || hashed.length < 10) {
        throw new Error('Failed to generate password hash');
      }

      return hashed;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (
        typeof password !== 'string' ||
        password.length === 0 ||
        typeof hashedPassword !== 'string' ||
        hashedPassword.length < 10
      ) {
        console.error('Invalid password or hash format');
        return false;
      }

      if (password.length > MAX_PASSWORD_LENGTH) {
        console.error('Password exceeds maximum length');
        return false;
      }

      if (
        !hashedPassword.startsWith('$2a$') &&
        !hashedPassword.startsWith('$2b$') &&
        !hashedPassword.startsWith('$2y$')
      ) {
        console.error('Invalid password hash format');
        return false;
      }

      return await compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        email.length === 0 ||
        password.length === 0
      ) {
        return null;
      }

      if (password.length > MAX_PASSWORD_LENGTH) {
        return null;
      }

      const user = await this.userRepository.getUserByEmail(email.trim().toLowerCase());

      if (!user) {
        await this.verifyPassword(
          'dummy_password',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq',
        );
        return null;
      }

      const isValid = await this.verifyPassword(password, user.password);

      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error in authenticateUser:', error);
      return null;
    }
  }

  async registerUser(email: string, password: string, name: string): Promise<User | null> {
    try {
      if (
        typeof password !== 'string' ||
        password.length < 6 ||
        password.length > MAX_PASSWORD_LENGTH
      ) {
        return null;
      }

      const existingUser = await this.userRepository.getUserByEmail(email);
      if (existingUser) {
        return null;
      }

      const hashedPassword = await this.hashPassword(password);
      if (!hashedPassword || typeof hashedPassword !== 'string' || hashedPassword.length < 10) {
        return null;
      }

      return await this.userRepository.createUser({
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      });
    } catch (error) {
      console.error('Error in registerUser:', error);
      return null;
    }
  }
}
