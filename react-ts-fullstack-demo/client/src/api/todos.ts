import type { Todo } from '../types';

const BASE = '/api/todos';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export const fetchTodos = () => request<Todo[]>(BASE);

export const addTodo = (text: string) =>
  request<Todo>(BASE, { method: 'POST', body: JSON.stringify({ text }) });

export const toggleTodo = (id: string, done: boolean) =>
  request<Todo>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });

export const deleteTodo = (id: string) =>
  request<void>(`${BASE}/${id}`, { method: 'DELETE' });