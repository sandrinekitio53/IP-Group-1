import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, API_URL } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FACEBOOK_ON = import.meta.env.VITE_ENABLE_FACEBOOK === "true";

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (confirm !== password) errors.confirm = "Passwords do not match.";
  return errors;
}

export default function Signup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const googleFailed = new URLSearchParams(window.location.search).get("error") === "google";

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  const blockPasswordAction = (e) => {
    e.preventDefault();
  };

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const strength = Math.min(4, (form.password.length >= 8) + /[A-Z]/.test(form.password) + /\d/.test(form.password) + /[^A-Za-z0-9]/.test(form.password));
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][form.password ? Math.max(1, strength) : 0];

  return (
    <main className="page">
      <aside className="brand">
        <div className="logo">TeamFlow</div>
        <h2>Plan. Track. <span>Ship together.</span></h2>
        <p>Projects, tasks and bugs in one place, with AI to help your team move faster.</p>

        <div className="board" aria-hidden="true">
          <div className="col">
            <h4>To do</h4>
            <div className="task"><i className="tag bug" />Fix login bug</div>
            <div className="task"><i className="tag feat" />Design dashboard</div>
          </div>
          <div className="col">
            <h4>In progress</h4>
            <div className="task float"><i className="tag feat" />Build signup page<span className="avatars"><b>C</b><b>F</b></span></div>
            <div className="task ai"><i className="tag ai" />AI suggests: split into 3 tasks</div>
          </div>
          <div className="col">
            <h4>Done</h4>
            <div className="task done"><i className="tag ok" />Signup API</div>
            <div className="task done"><i className="tag ok" />Google sign-in</div>
          </div>
        </div>
      </aside>

      <section className="card" aria-labelledby="title">
        <h1 id="title">Create your account</h1>
        <p className="sub">Start managing projects with your team.</p>

        {googleFailed && <div className="alert" role="alert">Google sign-in failed. Please try again.</div>}
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
        {FACEBOOK_ON && (
          <a className="google" style={{ marginTop: 10 }} href={`${API_URL}/api/auth/facebook`}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#1877F2" d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z"/>
            </svg>
            Continue with Facebook
          </a>
        )}

        <div className="divider"><span>or sign up with email</span></div>

        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={onChange} className={errors.name ? "bad" : ""} />
          {errors.name && <small className="err">{errors.name}</small>}

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} className={errors.email ? "bad" : ""} />
          {errors.email && <small className="err">{errors.email}</small>}

          <label htmlFor="password">Password</label>
          <div className="pw">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
              onCopy={blockPasswordAction}
              onCut={blockPasswordAction}
              className={errors.password ? "bad" : ""}
            />
            <button type="button" className="eye" onClick={() => setShowPw(!showPw)}>{showPw ? "Hide" : "Show"}</button>
          </div>
          {form.password && (
            <div className="meter" aria-live="polite">
              <div className={`bar s${strength}`} />
              <span>{strengthLabel}</span>
            </div>
          )}
          {errors.password && <small className="err">{errors.password}</small>}

          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirm}
            onChange={onChange}
            onCopy={blockPasswordAction}
            onCut={blockPasswordAction}
            className={errors.confirm ? "bad" : ""}
          />
          {errors.confirm && <small className="err">{errors.confirm}</small>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
        <p className="switch small"><Link to="/forgot-password">Forgot password?</Link></p>
      </section>
    </main>
  );
}