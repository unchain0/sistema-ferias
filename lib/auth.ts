import { compare, hash } from 'bcryptjs';
import { getUserByEmail, createUser } from './db-switch';
import { User } from '@/types';

const MAX_PASSWORD_LENGTH = 72; // Limite do bcrypt no pgcrypto

export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Invalid password');
    }
    
    // O bcrypt tem um limite de 72 bytes (não caracteres)
    // Se a senha for muito longa, vamos truncá-la para 72 caracteres
    // para evitar problemas de compatibilidade
    const passwordToHash = password.length > 72 ? password.substring(0, 72) : password;
    
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
    // Validação básica
    if (typeof email !== 'string' || typeof password !== 'string' || 
        email.length === 0 || password.length === 0) {
      console.error('Invalid email or password format');
      return null;
    }

    // Verifica se a senha está dentro do limite
    if (password.length > MAX_PASSWORD_LENGTH) {
      console.error('Password exceeds maximum length');
      return null;
    }

    // Busca o usuário pelo email
    const user = await getUserByEmail(email.trim().toLowerCase());
    
    if (!user) {
      console.log('User not found:', email);
      // Não revelar que o usuário não existe por questões de segurança
      // Simulamos a verificação de senha para evitar timing attacks
      await verifyPassword('dummy_password', '$2a$12$dummyhash.dummyhash.dummyhash');
      return null;
    }
    
    // Verifica a senha
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      console.log('Invalid password for user:', email);
      return null;
    }
    
    console.log('Authentication successful for user:', email);
    return user;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    console.log('Starting user registration for:', email);
    
    // Validação básica
    if (typeof password !== 'string' || password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      console.error('Invalid password length:', password?.length);
      return null;
    }

    // Verifica se o usuário já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
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

    console.log('User created successfully:', user.id);
    return user;
  } catch (error) {
    console.error('Error in registerUser:', error);
    return null;
  }
}
