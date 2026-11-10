import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../api.js';

const EMPTY_FORM = { newPassword: '', confirmPassword: '' };

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const resetToken = searchParams.get('token') || routeToken || '';
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const nextErrors = {};

    if (!resetToken) nextErrors.token = 'Reset link is missing or invalid.';
    if (form.newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    return nextErrors;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${encodeURIComponent(resetToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: form.newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Unable to reset password.');
      }

      setDone(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setErrors((prev) => ({ ...prev, token: err.message || 'Unable to reset password.' }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <aside className="brand">
        <div className="logo">TeamFlow</div>
        <h2>Create a <span>new password</span></h2>
        <p>
          Choose a secure password to protect your account before you continue back into your workspace.
        </p>

        <div className="board" aria-hidden="true">
          <div className="col">
            <h4>Verify</h4>
            <div className="task"><i className="tag feat" />Code confirmed</div>
            <div className="task"><i className="tag bug" />Check security</div>
          </div>
          <div className="col">
            <h4>Update</h4>
            <div className="task float"><i className="tag ai" />Create new password</div>
            <div className="task"><i className="tag ok" />Save changes</div>
          </div>
          <div className="col">
            <h4>Ready</h4>
            <div className="task done"><i className="tag ok" />Signed in</div>
            <div className="task done"><i className="tag ok" />Back online</div>
          </div>
        </div>
      </aside>

      <section className="card" aria-labelledby="reset-title">
        <h1 id="reset-title">Set a new password</h1>
        <p className="sub">Use the code from your email and choose a strong password.</p>

        {done && (
          <div className="alert" role="alert">
            Your password has been updated successfully. You can now <Link to="/login">log in</Link>.
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          {errors.token && <small className="err">{errors.token}</small>}

          <label htmlFor="newPassword">New password</label>
          <div className="pw">
            <input
              id="newPassword"
              name="newPassword"
              type={showPw ? 'text' : 'password'}
              value={form.newPassword}
              onChange={onChange}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              className={errors.newPassword ? 'bad' : ''}
            />
            <button type="button" className="eye" onClick={() => setShowPw((prev) => !prev)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.newPassword && <small className="err">{errors.newPassword}</small>}

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="pw">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPw ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={onChange}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              className={errors.confirmPassword ? 'bad' : ''}
            />
            <button type="button" className="eye" onClick={() => setShowPw((prev) => !prev)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <small className="err">{errors.confirmPassword}</small>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="switch">
          Need another code? <Link to="/forgot-password">Send again</Link>
        </p>
      </section>
    </main>
  );
}
