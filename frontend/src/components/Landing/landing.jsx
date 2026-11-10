import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css'
import {
  NAV, FEATURES, STEPS, ROLES, BOARD,
  TASK_CHART, BUG_CHART, DUE_SOON, TASK_CARD, BUG_FORM, ACTIVITY, FAQ,
} from '../../assets/assets.js';

const maxOf = (rows) => Math.max(...rows.map((r) => r[1]));
const Bars = ({ rows }) =>
  rows.map(([label, n, tone]) => (
    <div className="lp-bar" key={label}>
      <span>{label}</span>
      <i className={tone} style={{ width: `${(n / maxOf(rows)) * 100}%` }} />
      <b>{n}</b>
    </div>
  ));

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH = `${API}/api/auth`;
const OPTS = { credentials: 'include' };

const COLS = Object.keys(BOARD);

// A working drag-and-drop board: the project's core feature, right in the hero
function LiveBoard() {
  const [board, setBoard] = useState(BOARD);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [log, setLog] = useState([]);

  function move(id, from, to) {
    if (!to || from === to) return;
    const card = board[from].find((c) => c.id === id);
    if (!card) return;
    setBoard((b) => ({
      ...b,
      [from]: b[from].filter((c) => c.id !== id),
      [to]: [...b[to], card],
    }));
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLog((l) => [`You moved “${card.t}” to ${to} at ${time}`, ...l].slice(0, 3));
  }

  return (
    <div className="lp-live">
      <p className="lp-caption">Try it: drag a card to another column, or tap its arrow.</p>
      <div className="lp-board">
        {COLS.map((col, i) => (
          <div
            key={col}
            className={`lp-col ${over === col ? 'over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(col); }}
            onDragLeave={() => setOver(null)}
            onDrop={() => { if (drag) move(drag.id, drag.from, col); setDrag(null); setOver(null); }}
          >
            <h3>{col} <span>{board[col].length}</span></h3>
            {board[col].map((c) => (
              <div
                key={c.id}
                className={`lp-card ${c.p} ${col === 'Done' ? 'done' : ''}`}
                draggable
                onDragStart={() => setDrag({ id: c.id, from: col })}
                onDragEnd={() => { setDrag(null); setOver(null); }}
              >
                <span>{c.t}</span>
                {i < COLS.length - 1 && (
                  <button aria-label={`Move ${c.t} to ${COLS[i + 1]}`} onClick={() => move(c.id, col, COLS[i + 1])}>→</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <ul className="lp-feed" aria-live="polite">
        {log.length === 0 ? <li>Your moves appear here, like the activity log in the app.</li> : log.map((l) => <li key={l}>{l}</li>)}
      </ul>
    </div>
  );
}

export default function Landing() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const getSession = () => fetch(`${AUTH}/session`, OPTS).then((r) => r.json());

    (async () => {
      try {
        let data = await getSession();
        if (!data.user) {
          // access token lasts 15 minutes; try the refresh cookie once
          const r = await fetch(`${AUTH}/refresh`, { ...OPTS, method: 'POST' });
          if (r.ok) data = await getSession();
        }
        if (alive) setUser(data.user || null);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => { alive = false; };
  }, []);

  async function logout() {
    try {
      await fetch(`${AUTH}/logout`, { ...OPTS, method: 'POST' });
    } catch { /* cookie is cleared server-side when reachable */ }
    setUser(null);
    setOpen(false);
  }

  const close = () => setOpen(false);

  return (
    <div className="lp">
      <header className="lp-nav">
        <a className="lp-logo" href="#top" onClick={close}>TeamFlow</a>

        <button
          className="lp-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="lp-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav id="lp-menu" className={`lp-menu ${open ? 'open' : ''}`} aria-label="Main">
          <ul>
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} onClick={close}>{label}</a></li>
            ))}
          </ul>

          <div className="lp-auth">
            {!ready ? null : user ? (
              <>
                <span className="lp-hello">Hi, {user.name.split(' ')[0]}</span>
                <button className="lp-btn ghost" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <Link className="lp-btn ghost" to="/login" onClick={close}>Log in</Link>
                <Link className="lp-btn solid" to="/signup" onClick={close}>Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="lp-hero">
          <div className="lp-hero-text">
            <h1>Your team’s tasks and bugs, in one place instead of the group chat.</h1>
            <p>
              TeamFlow gives student and small dev teams a shared workspace to plan projects,
              assign tasks, report bugs and track everything through to done.
            </p>
            {user ? (
              <p className="lp-note">You’re signed in. Your workspace is ready when you are.</p>
            ) : (
              <div className="lp-cta">
                <Link className="lp-btn solid big" to="/signup">Create a free account</Link>
                <a className="lp-btn ghost big" href="#how">See how it works</a>
              </div>
            )}
          </div>

          <LiveBoard />
        </section>

        <section className="lp-section" id="problem">
          <h2>Work gets lost when it lives in WhatsApp</h2>
          <div className="lp-split">
            <div>
              <h3>Today</h3>
              <ul className="lp-list bad">
                <li>Tasks are forgotten and nobody knows who is doing what.</li>
                <li>Bugs are reported in voice notes, then lost.</li>
                <li>Leaders can’t see progress, and deadlines are missed.</li>
                <li>There is no history of what changed, by whom, or why.</li>
              </ul>
            </div>
            <div>
              <h3>With TeamFlow</h3>
              <ul className="lp-list good">
                <li>Every task has an owner, a priority and a deadline.</li>
                <li>Every bug has steps to reproduce and a screenshot.</li>
                <li>A dashboard shows tasks done vs pending and bugs by priority.</li>
                <li>An activity log records every change.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section" id="features">
          <h2>Seven modules, one workspace</h2>
          <div className="lp-grid">
            {FEATURES.map(([t, d]) => (
              <article key={t}><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="preview">
          <h2>See what your team will see</h2>
          <p className="lp-lead">These screens use example data to show how the dashboard, a task card and the bug form look.</p>

          <div className="lp-dash">
            <div className="lp-panel"><h3>Tasks done vs pending</h3><Bars rows={TASK_CHART} /></div>
            <div className="lp-panel"><h3>Bugs by priority</h3><Bars rows={BUG_CHART} /></div>
            <div className="lp-panel">
              <h3>Tasks due soon</h3>
              <ul className="lp-due">
                {DUE_SOON.map(([t, d]) => <li key={t}><span>{t}</span><b>{d}</b></li>)}
              </ul>
            </div>
          </div>

          <div className="lp-trio">
            <article className="lp-panel">
              <h3>Task card</h3>
              <strong>{TASK_CARD.title}</strong>
              <p>{TASK_CARD.desc}</p>
              <dl>
                {TASK_CARD.fields.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
              </dl>
              <div className="lp-comment"><b>{TASK_CARD.comment[0]}</b> {TASK_CARD.comment[1]}</div>
            </article>

            <article className="lp-panel">
              <h3>Bug report form</h3>
              <dl>
                {BUG_FORM.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
              </dl>
            </article>

            <article className="lp-panel">
              <h3>Activity log</h3>
              <ul className="lp-log">
                {ACTIVITY.map(([who, what, time]) => (
                  <li key={what}><span><b>{who}</b> {what}</span><time>{time}</time></li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="lp-section" id="how">
          <h2>How it works</h2>
          <ol className="lp-steps">
            {STEPS.map(([t, d]) => (
              <li key={t}><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </section>

        <section className="lp-section" id="roles">
          <h2>A role for everyone on the team</h2>
          <div className="lp-grid three">
            {ROLES.map(([t, d]) => (
              <article key={t}><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="faq">
          <h2>Questions teams ask</h2>
          <div className="lp-faq">
            {FAQ.map(([q, ans]) => (
              <details key={q}><summary>{q}</summary><p>{ans}</p></details>
            ))}
          </div>
        </section>

        {!user && (
          <section className="lp-final">
            <h2>Stop chasing updates in chat.</h2>
            <Link className="lp-btn accent big" to="/signup">Create your first project</Link>
          </section>
        )}
      </main>

      <footer className="lp-footer">
        <span>TeamFlow: web project management and bug tracking</span>
        <a href="#top">Back to top</a>
      </footer>
    </div>
  );
}
