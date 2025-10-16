import { compare, hash } from 'bcryptjs';
import { getUserByEmail, createUser } from './db';
import { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    return null;
  }
  
  const hashedPassword = await hashPassword(password);
  
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
  };
  
  return createUser(user);
}
