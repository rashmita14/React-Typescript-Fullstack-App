import { apiRequest } from './api';

export interface Todo {
  _id: string;
  text: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchTodos = () => apiRequest<Todo[]>('/todos');

export const addTodo = (text: string) =>
  apiRequest<Todo>('/todos', { method: 'POST', body: JSON.stringify({ text }) });

export const toggleTodo = (id: string, done: boolean) =>
  apiRequest<Todo>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });

export const deleteTodo = (id: string) =>
  apiRequest<void>(`/todos/${id}`, { method: 'DELETE' });
