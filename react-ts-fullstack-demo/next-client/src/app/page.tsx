'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { authenticate, getCurrentUser, signOut, type AuthUser } from '@/lib/auth';
import { addTodo, deleteTodo, fetchTodos, toggleTodo, type Todo } from '@/lib/todos';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setError('Unable to reach the API. Check the server and API URL.'))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    setLoadingTodos(true);
    fetchTodos()
      .then(setTodos)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoadingTodos(false));
  }, [user]);

  async function handleAuthentication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setUser(await authenticate(authMode, email, password));
      setPassword('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    }
  }

  async function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const created = await addTodo(text.trim());
      setTodos((current) => [created, ...current]);
      setText('');
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add todo');
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      const updated = await toggleTodo(todo._id, !todo.done);
      setTodos((current) => current.map((item) => item._id === updated._id ? updated : item));
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update todo');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo(id);
      setTodos((current) => current.filter((todo) => todo._id !== id));
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete todo');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign out');
    }
  }

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center px-5 text-sm text-stone-500">Restoring your space...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.2em] text-emerald-800">ONE THING AT A TIME</span>
        <div className="flex items-center gap-3">
          <a className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-white" href="/examples">UI examples</a>
          {user && (
            <button className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-white" onClick={handleSignOut}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {!user ? (
        <section className="mx-auto w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-emerald-800">YOUR PERSONAL SPACE</p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">{authMode === 'login' ? 'Welcome back.' : 'Start fresh.'}</h1>
          <p className="mb-7 text-sm leading-6 text-stone-500">
            {authMode === 'login' ? 'Sign in to pick up where you left off.' : 'Create an account to keep your list in sync.'}
          </p>
          <form className="space-y-4" onSubmit={handleAuthentication}>
            <label className="block text-sm font-medium">
              Email
              <input className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button className="w-full rounded-xl bg-emerald-900 px-4 py-3 font-medium text-white hover:bg-emerald-800" type="submit">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button className="mt-5 w-full text-sm text-stone-600 underline underline-offset-4" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(null); }}>
            {authMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
          </button>
        </section>
      ) : (
        <>
          <section className="mb-8">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-emerald-800">A LITTLE WORK IN PROGRESS</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Make room<br />for what matters.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-stone-600">A focused list for the next small thing. Your changes are saved to MongoDB.</p>
          </section>
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Next up</h2>
                <p className="mt-1 text-sm text-stone-500">{user.email}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                {todos.filter((todo) => !todo.done).length} OPEN
              </span>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAddTodo}>
              <label className="sr-only" htmlFor="todo-text">What needs to be done?</label>
              <input id="todo-text" className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700" maxLength={200} placeholder="What needs to be done?" value={text} onChange={(event) => setText(event.target.value)} />
              <button className="rounded-xl bg-emerald-900 px-6 py-3 font-medium text-white hover:bg-emerald-800" type="submit">Add task</button>
            </form>
            {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
            {loadingTodos ? <p className="py-8 text-sm text-stone-500">Loading your list...</p> : (
              todos.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">Your list is clear. Add a first task above.</p> : (
                <ul className="mt-5 divide-y divide-stone-100">
                  {todos.map((todo) => (
                    <li className="flex items-center gap-3 py-4" key={todo._id}>
                      <input aria-label={`Mark ${todo.text} ${todo.done ? 'incomplete' : 'complete'}`} className="size-5 accent-emerald-800" type="checkbox" checked={todo.done} onChange={() => handleToggle(todo)} />
                      <span className={`min-w-0 flex-1 break-words text-sm ${todo.done ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{todo.text}</span>
                      <button className="shrink-0 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => handleDelete(todo._id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>
        </>
      )}
    </main>
  );
}
