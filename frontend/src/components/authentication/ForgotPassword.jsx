import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Unable to send reset link.');
      }

      setSent(true);
    } catch (err) {
      setError(err.message || 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <aside className="brand">
        <div className="logo">TeamFlow</div>
        <h2>Reset access <span>without losing momentum.</span></h2>
        <p>
          We’ll help you get back into your workspace quickly and safely with a secure password reset.
        </p>

        <div className="board" aria-hidden="true">
          <div className="col">
            <h4>Today</h4>
            <div className="task"><i className="tag feat" />Review the issue</div>
            <div className="task"><i className="tag bug" />Fix login blocker</div>
          </div>
          <div className="col">
            <h4>Access</h4>
            <div className="task float"><i className="tag ai" />Reset link sent</div>
            <div className="task"><i className="tag ok" />Secure password change</div>
          </div>
          <div className="col">
            <h4>Done</h4>
            <div className="task done"><i className="tag ok" />Account verified</div>
            <div className="task done"><i className="tag ok" />Ready to continue</div>
          </div>
        </div>
      </aside>

      <section className="card" aria-labelledby="forgot-title">
        <h1 id="forgot-title">Forgot password?</h1>
        <p className="sub">
          {sent
            ? 'Your reset link has been sent.'
            : 'Enter the email address linked to your account and we’ll send a reset link.'}
        </p>

        {!sent ? (
          <form onSubmit={onSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'bad' : ''}
              placeholder="you@example.com"
            />
            {error && <small className="err">{error}</small>}

            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div className="alert" role="alert">
            A password reset link has been sent to {email.trim()}. Check your inbox and follow the instructions.
          </div>
        )}

        <div className="switch small">
          <Link to="/reset-password">I already have a reset code</Link>
        </div>
        <p className="switch">
          Back to <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
