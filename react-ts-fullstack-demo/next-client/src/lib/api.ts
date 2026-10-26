const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api').replace(/\/+$/, '');

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json() as { message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }

  return body as T;
}
