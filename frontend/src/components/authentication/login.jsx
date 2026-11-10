import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, API_URL } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
// import './login.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM = { email: '', password: '' };

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const idleMessage = searchParams.get('reason') === 'idle' ? 'You were logged out due to inactivity.' : '';

  // Wipe everything if the browser restores this page from its back/forward cache
  useEffect(() => {
    const reset = (e) => {
      if (e.persisted) {
        setForm(EMPTY_FORM);
        setErrors({});
        setShowPw(false);
        setServerError('');
      }
    };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  const blockPasswordAction = (e) => {
    e.preventDefault();
  };

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');

    const email = form.email.trim();
    const nextErrors = {};
    if (!EMAIL_RE.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = { email, password: form.password };
    setForm((prev) => ({ ...prev, password: '' }));
    setShowPw(false);
    setLoading(true);

    try {
      await loginUser(payload);
      await refreshUser();
      setForm(EMPTY_FORM);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card" aria-labelledby="login-title">
        <h1 id="login-title">Log in</h1>
        <p className="sub">Welcome back! Please sign in to continue.</p>

        {idleMessage && <div className="alert" role="alert">{idleMessage}</div>}
        {serverError && <div className="alert" role="alert">{serverError}</div>}

        <a className="google" href={`${API_URL}/api/auth/google`}>
         <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/>
            <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </a>
        <div className="divider"><span>or continue with email</span></div>

        <form onSubmit={onSubmit} noValidate autoComplete="off">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={onChange}
            className={errors.email ? 'bad' : ''}
          />
          {errors.email && <small className="err">{errors.email}</small>}

          <label htmlFor="password">Password</label>
          <div className="pw">
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
              onCopy={blockPasswordAction}
              onCut={blockPasswordAction}
              className={errors.password ? 'bad' : ''}
            />
            <button type="button" className="eye" onClick={() => setShowPw((prev) => !prev)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <small className="err">{errors.password}</small>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="switch">New here? <Link to="/signup">Create an account</Link></p>
        <p className="switch small"><Link to="/forgot-password">Forgot password?</Link></p>
      </section>

      <aside className="brand">
        <div className="logo">TeamFlow</div>
        <h2>
          Welcome back <span>to your workflow.</span>
        </h2>
        <p>
          Keep your tasks moving, your team aligned, and your projects on schedule with one clean workspace.
        </p>

        <div className="board" aria-hidden="true">
          <div className="col">
            <h4>Today</h4>
            <div className="task"><i className="tag feat" />Review sprint notes</div>
            <div className="task"><i className="tag bug" />Fix onboarding issue</div>
          </div>
          <div className="col">
            <h4>In progress</h4>
            <div className="task float"><i className="tag feat" />Launch login flow</div>
            <div className="task ai"><i className="tag ai" />AI summary ready</div>
          </div>
          <div className="col">
            <h4>Done</h4>
            <div className="task done"><i className="tag ok" />Team sync</div>
            <div className="task done"><i className="tag ok" />Weekly report</div>
          </div>
        </div>
      </aside>
    </main>
  );
}