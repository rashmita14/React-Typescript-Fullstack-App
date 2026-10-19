export interface AuthUser {
  id: string;
  email: string;
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const result = await authRequest<{ user: AuthUser }>('me');
    return result.user;
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') return null;
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  return authRequest<{ user: AuthUser }>('login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signUp(email: string, password: string) {
  return authRequest<{ user: AuthUser }>('register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export const signOut = () => authRequest<void>('logout', { method: 'POST' });