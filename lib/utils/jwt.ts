import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  } as any);
}

// Legacy aliases for compatibility with existing imports
export function generateAccessToken(payload: TokenPayload): string {
  return generateToken(payload);
}

export function generateRefreshToken(payload: TokenPayload): string {
  // Refresh tokens can have longer expiration; fallback to env or 30d
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
  } as any);
}

export function getAccessTokenExpiry(): string {
  return (process.env.JWT_EXPIRATION as string) || '7d';
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  return verifyToken(token);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}
