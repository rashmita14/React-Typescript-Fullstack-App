import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './components/Button';
import { addTodo, deleteTodo, fetchTodos, toggleTodo } from './api/todos';
import type { Todo } from './types';
import './App.css';

export default function App() {
  const [count, setCount] = useState<number>(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const created = await addTodo(text);
      setTodos((previous) => [created, ...previous]);
      setText('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add todo');
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await toggleTodo(todo._id, !todo.done);
      setTodos((previous) => previous.map((item) => item._id === updated._id ? updated : item));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((previous) => previous.filter((todo) => todo._id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete todo');
    }
  };

  return (
    <main className="app">
      <header className="page-heading">
        <p className="eyebrow">A LITTLE WORK IN PROGRESS</p>
        <h1>Make room<br />for what matters.</h1>
        <p className="intro">A focused list for the next small thing. Changes are saved to MongoDB.</p>
      </header>

      <section className="demo-grid" aria-label="Interactive examples">
        <section className="card counter-card">
          <div className="section-heading">
            <div><p className="eyebrow">01 / STATE</p><h2>Momentum</h2></div>
            <span className="counter-value">{count.toString().padStart(2, '0')}</span>
          </div>
          <p className="muted">One click is still a start.</p>
          <Button label="Add a step" onClick={() => setCount((value) => value + 1)} />
        </section>

        <section className="card todo-card">
          <div className="section-heading">
            <div><p className="eyebrow">02 / YOUR LIST</p><h2>Next up</h2></div>
            <span className="todo-count">{todos.filter((todo) => !todo.done).length} OPEN</span>
          </div>
          <form onSubmit={handleAdd} className="row todo-form">
            <label className="visually-hidden" htmlFor="todo-text">What needs to be done?</label>
            <input id="todo-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="What needs to be done?" maxLength={200} />
            <Button label="Add" type="submit" />
          </form>
          {error && <p className="error" role="alert">{error}</p>}
          {loading ? <p className="muted">Loading your list...</p> : (
            todos.length === 0 ? <p className="empty-state">Your list is clear. Add a first task above.</p> : (
              <ul className="todo-list">
                {todos.map((todo) => (
                  <li key={todo._id} className="row todo-row">
                    <label className={`todo-label${todo.done ? ' done' : ''}`}>
                      <input type="checkbox" checked={todo.done} onChange={() => handleToggle(todo)} />
                      <span>{todo.text}</span>
                    </label>
                    <Button label="Delete" variant="danger" onClick={() => handleDelete(todo._id)} />
                  </li>
                ))}
              </ul>
            )
          )}
        </section>
      </section>
      <footer className="footer"><span>REACT + TYPESCRIPT</span><span>ONE THING AT A TIME</span></footer>
    </main>
  );
}
