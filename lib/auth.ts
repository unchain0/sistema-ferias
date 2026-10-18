import { compare, hash } from 'bcryptjs';

import type { User } from '@/types';

import { getUserByEmail, createUser } from './db-switch';
import { secureCompare } from './input-validation';
import { DEMO_EMAIL, DEMO_PASSWORD, getDemoSnapshot, isDemoEmail } from './seed-demo';
import { isStorageUnavailable } from './storage-errors';

const MAX_PASSWORD_LENGTH = 72; // Limite do bcrypt no pgcrypto

export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Invalid password');
  }

  // O bcrypt tem um limite de 72 bytes (não caracteres)
  // Verifica o tamanho em bytes e trunca se necessário
  let passwordToHash = password;
  if (Buffer.byteLength(password, 'utf8') > 72) {
    // Trunca para 72 bytes, respeitando limites de caracteres UTF-8
    let byteLength = 0;
    let charIndex = 0;
    // eslint-disable-next-line no-constant-binary-expression -- byteLength changes each iteration
    while (charIndex < password.length && byteLength < 72) {
      const char = password[charIndex];
      if (char === undefined) break;
      const charBytes = Buffer.byteLength(char, 'utf8');
      if (byteLength + charBytes > 72) break;
      byteLength += charBytes;
      charIndex++;
    }
    passwordToHash = password.slice(0, Math.max(0, charIndex));
  }

  const hashed = await hash(passwordToHash, 12);

  if (typeof hashed !== 'string' || hashed.length < 10) {
    throw new Error('Failed to generate password hash');
  }

  return hashed;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Validação básica
    if (typeof password !== 'string' || password.length === 0 ||
        typeof hashedPassword !== 'string' || hashedPassword.length < 10) {
      return false;
    }

    // Verifica o comprimento máximo
    if (password.length > MAX_PASSWORD_LENGTH) {
      return false;
    }

    // Verifica se o hash parece ser um hash bcrypt válido
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$') &&
        !hashedPassword.startsWith('$2y$')) {
      return false;
    }

    // Compara as senhas
    const isValid = await compare(password, hashedPassword);
    return isValid;
  } catch {
    // Em caso de erro, retornamos false em vez de propagar o erro
    // para evitar vazamento de informações sensíveis
    return false;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    if (typeof email !== 'string' || typeof password !== 'string' ||
        email.length === 0 || password.length === 0) {
      return null;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Demo account must work even when Supabase/DNS is down: seed credentials
    // are the source of truth for this read-only path.
    if (isDemoEmail(normalizedEmail)) {
      if (!secureCompare(password, DEMO_PASSWORD)) {
        return null;
      }
      try {
        const existing = await getUserByEmail(DEMO_EMAIL);
        if (existing !== null) {
          const ok = await verifyPassword(password, existing.password);
          if (ok) return existing;
        }
      } catch (error) {
        if (!isStorageUnavailable(error)) {
          console.error('Demo auth storage error:', error);
        }
      }
      return (await getDemoSnapshot()).user;
    }

    const user = await getUserByEmail(normalizedEmail);

    if (user === null) {
      // Timing-safe: verify against dummy hash even for non-existent users
      await verifyPassword('dummy_password', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq');
      return null;
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    // Validação básica
    if (typeof password !== 'string' || password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      return null;
    }

    // Verifica se o usuário já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser !== null) {
      return null;
    }

    // Gera o hash da senha
    const hashedPassword = await hashPassword(password);
    if (typeof hashedPassword !== 'string' || hashedPassword.length < 10) {
      return null;
    }

    // Cria o usuário
    const user = await createUser({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
    });

    if (user === null) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}