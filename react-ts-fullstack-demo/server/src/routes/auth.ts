import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { User } from '../models/User.js';
import { clearSessionCookie, createSession, isAuthConfigured, requireAuth, setSessionCookie } from '../middleware/auth.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const passwordRounds = 12;

function publicUser(user: { id: string; email: string }) {
  return { id: user.id, email: user.email };
}

function isDuplicateEmail(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

router.post('/register', loginLimiter, async (request, response) => {
  if (!isAuthConfigured()) {
    response.status(503).json({ message: 'Authentication is not configured on this server' });
    return;
  }
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    response.status(400).json({ message: 'Enter a valid email address' });
    return;
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    response.status(400).json({ message: 'Password must be between 8 and 72 characters' });
    return;
  }

  try {
    const user = await User.create({ email, passwordHash: await bcrypt.hash(password, passwordRounds) });
    setSessionCookie(response, createSession(user.id));
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (isDuplicateEmail(error)) {
      response.status(409).json({ message: 'An account with this email already exists' });
      return;
    }
    throw error;
  }
});

router.post('/login', loginLimiter, async (request, response) => {
  if (!isAuthConfigured()) {
    response.status(503).json({ message: 'Authentication is not configured on this server' });
    return;
  }
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ message: 'Email or password is incorrect' });
    return;
  }

  setSessionCookie(response, createSession(user.id));
  response.json({ user: publicUser(user) });
});

router.get('/me', requireAuth, async (request, response) => {
  const user = await User.findById(request.userId);
  if (!user) {
    clearSessionCookie(response);
    response.status(401).json({ message: 'Authentication required' });
    return;
  }
  response.json({ user: publicUser(user) });
});

router.post('/logout', (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

export default router;