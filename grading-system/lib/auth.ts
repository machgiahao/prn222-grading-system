// Authentication utilities and session management
import crypto from 'crypto';

interface AuthSession {
  userId: string;
  username: string;
  fullName: string;
  roles: string[];
  expiresAt: number;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createSession(user: any): AuthSession {
  return {
    userId: user.id,
    username: user.username,
    fullName: user.full_name,
    roles: user.roles || [],
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}
