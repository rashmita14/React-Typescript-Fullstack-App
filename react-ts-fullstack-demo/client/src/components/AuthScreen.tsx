import { useState, type FormEvent } from 'react';
import { signIn, signUp, type AuthUser } from '../api/auth';
import '../AuthScreen.css';

interface AuthScreenProps {
  initialMessage?: string | null;
  onAuthenticated: (user: AuthUser) => void;
}

export function AuthScreen({ initialMessage, onAuthenticated }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialMessage ?? null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = isRegistering
        ? await signUp(email, password)
        : await signIn(email, password);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setError(null);
  };

  return (
    <main className="auth-screen">
      <section className="auth-story" aria-label="Product introduction">
        <div className="auth-brand"><span className="brand-mark" aria-hidden="true">N</span><span>NOTED / DAILY</span></div>
        <div className="story-copy">
          <p className="auth-kicker">A LITTLE WORK IN PROGRESS</p>
          <h1>Make room<br />for what matters.</h1>
          <p>Keep your next small thing close, and let the rest wait its turn.</p>
        </div>
        <p className="story-footnote">A calmer way to move through the day.</p>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-form-wrap">
          <p className="auth-kicker">YOUR SPACE, YOUR PACE</p>
          <h2 id="auth-title">{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-subtitle">
            {isRegistering ? 'Start with an email and a password.' : 'Sign in to pick up where you left off.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" onClick={switchMode}>
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          <p className="auth-security">Your password is hashed before it is stored.</p>
        </div>
        <footer className="auth-footer"><span>REACT + TYPESCRIPT</span><span>ONE THING AT A TIME</span></footer>
      </section>
    </main>
  );
}