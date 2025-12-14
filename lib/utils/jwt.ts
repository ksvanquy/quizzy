import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRE || process.env.JWT_EXPIRATION || '7d';
  
  console.log('[JWT.generateToken] Generating token with:', {
    payload,
    secretLength: secret.length,
    secretPrefix: secret.substring(0, 10),
    expiresIn,
    nodeEnv: process.env.NODE_ENV,
  });
  
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as any);
  
  console.log('[JWT.generateToken] Token generated:', {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 30),
  });
  
  return token;
}

// Legacy aliases for compatibility with existing imports
export function generateAccessToken(payload: TokenPayload): string {
  return generateToken(payload);
}

export function generateRefreshToken(payload: TokenPayload): string {
  // Refresh tokens can have longer expiration; fallback to env or 30d
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRATION || '30d';
  return jwt.sign(payload, secret, {
    expiresIn,
  } as any);
}

export function getAccessTokenExpiry(): string {
  return (process.env.JWT_EXPIRE || process.env.JWT_EXPIRATION || '7d') as string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    
    // console.log('[JWT.verifyToken] Verifying token with:', {
    //   secretLength: secret.length,
    //   secretPrefix: secret.substring(0, 10),
    //   tokenLength: token?.length,
    //   tokenPrefix: token?.substring(0, 30),
    //   nodeEnv: process.env.NODE_ENV,
    // });
    
    const payload = jwt.verify(token, secret) as TokenPayload;
    
    // console.log('[JWT.verifyToken] Token verified successfully:', {
    //   userId: payload.userId,
    //   email: payload.email,
    //   role: payload.role,
    // });
    
    return payload;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const secret = process.env.JWT_SECRET || 'secret';
    
    console.error('[JWT.verifyToken] Verification failed:', {
      error: errorMsg,
      secretLength: secret.length,
      secretPrefix: secret.substring(0, 10),
      tokenLength: token?.length,
      tokenPrefix: token?.substring(0, 30),
    });
    return null;
  }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  return verifyToken(token);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    console.log('[JWT.decodeToken] Decoded token:', {
      payload: decoded,
      iat: (jwt.decode(token, { complete: true }) as any)?.payload?.iat,
      exp: (jwt.decode(token, { complete: true }) as any)?.payload?.exp,
      now: Math.floor(Date.now() / 1000),
    });
    return decoded;
  } catch (error) {
    console.error('[JWT.decodeToken] Decode failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Debug utility: Verify token and log detailed info
 */
export function debugVerifyToken(token: string): { valid: boolean; payload: TokenPayload | null; error?: string } {
  try {
    const decoded = jwt.decode(token, { complete: true }) as any;
    // console.log('[JWT.debugVerifyToken] Token structure:', {
    //   header: decoded?.header,
    //   payload: decoded?.payload,
    //   timestamp: new Date().toISOString(),
    // });

    const payload = verifyToken(token);
    return { valid: !!payload, payload, error: undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[JWT.debugVerifyToken] Error:', errorMsg);
    return { valid: false, payload: null, error: errorMsg };
  }
}
