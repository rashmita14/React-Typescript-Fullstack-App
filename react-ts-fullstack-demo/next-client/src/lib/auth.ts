import { apiRequest } from './api';

export interface AuthUser {
  id: string;
  email: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const result = await apiRequest<{ user: AuthUser }>('/auth/me');
    return result.user;
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') return null;
    throw error;
  }
}

export async function authenticate(path: 'login' | 'register', email: string, password: string) {
  const result = await apiRequest<{ user: AuthUser }>(`/auth/${path}`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result.user;
}

export const signOut = () => apiRequest<void>('/auth/logout', { method: 'POST' });
