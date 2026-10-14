import { compare, hash } from 'bcryptjs';
import { getUserByEmail, createUser } from './db-switch';
import { User } from '@/types';
import { DEMO_EMAIL, DEMO_PASSWORD, getDemoSnapshot, isDemoEmail } from './seed-demo';
import { secureCompare } from './input-validation';
import { isStorageUnavailable } from './storage-errors';

const MAX_PASSWORD_LENGTH = 72; // Limite do bcrypt no pgcrypto

export async function hashPassword(password: string): Promise<string> {
  try {
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

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Validação básica
    if (typeof password !== 'string' || password.length === 0 || 
        typeof hashedPassword !== 'string' || hashedPassword.length < 10) {
      console.error('Invalid password or hash format');
      return false;
    }

    // Verifica o comprimento máximo
    if (password.length > MAX_PASSWORD_LENGTH) {
      console.error('Password exceeds maximum length');
      return false;
    }

    // Verifica se o hash parece ser um hash bcrypt válido
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$') && 
        !hashedPassword.startsWith('$2y$')) {
      console.error('Invalid password hash format');
      return false;
    }

    // Compara as senhas
    const isValid = await compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    // Em caso de erro, retornamos false em vez de propagar o erro
    // para evitar vazamento de informações sensíveis
    return false;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    if (typeof email !== 'string' || typeof password !== 'string' ||
        email.length === 0 || password.length === 0) {
      console.error('Invalid email or password format');
      return null;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      console.error('Password exceeds maximum length');
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
        if (existing) {
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

    if (!user) {
      console.log('User not found');
      await verifyPassword('dummy_password', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSVEGrwQcxIq');
      return null;
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      console.log('Invalid password for user');
      return null;
    }

    console.log('Authentication successful');
    return user;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    console.log('Starting user registration');
    
    // Validação básica
    if (typeof password !== 'string' || password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      console.error('Invalid password length:', password?.length);
      return null;
    }

    // Verifica se o usuário já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists');
      return null;
    }
    
    // Gera o hash da senha
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword || typeof hashedPassword !== 'string' || hashedPassword.length < 10) {
      console.error('Invalid password hash generated');
      return null;
    }

    console.log('Creating user with hashed password, length:', hashedPassword.length);
    
    // Cria o usuário
    const user = await createUser({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
    });

    if (!user) {
      console.error('Failed to create user');
      return null;
    }

    console.log('User created successfully');
    return user;
  } catch (error) {
    console.error('Error in registerUser:', error);
    return null;
  }
}
