import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const COOKIE_NAME = 'todo_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getTokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;
  return secret && secret.length >= 32 ? secret : undefined;
}

export const isAuthConfigured = () => Boolean(getTokenSecret());

function cookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' as const : 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS * 1000,
  };
}

export function createSession(userId: string) {
  const secret = getTokenSecret();
  if (!secret) throw new Error('AUTH_TOKEN_SECRET is not configured');
  return jwt.sign({}, secret, { subject: userId, expiresIn: SESSION_DURATION_SECONDS });
}

export function setSessionCookie(response: Response, token: string) {
  response.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(COOKIE_NAME, cookieOptions());
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  const secret = getTokenSecret();

  if (!secret) {
    response.status(503).json({ message: 'Authentication is not configured on this server' });
    return;
  }
  if (!token) {
    response.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(decodeURIComponent(token), secret);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') throw new Error('Invalid session');
    request.userId = decoded.sub;
    next();
  } catch {
    response.status(401).json({ message: 'Authentication required' });
  }
}

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export type SessionPayload = JwtPayload;