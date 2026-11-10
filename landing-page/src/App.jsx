import { useState } from 'react';

const NAV = [
  ['#overview', 'Overview'],
  ['#problem', 'Problem'],
  ['#modules', 'Modules'],
  ['#views', 'Product Views'],
  ['#workflow', 'Workflow'],
  ['#api', 'REST API'],
  ['#security', 'Security'],
  ['#data', 'Data Model'],
  ['#run', 'Run on Server'],
];

export default function App() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <nav className="navbar" aria-label="Primary navigation">
          <div className="brand" aria-label="TeamFlow">
            <span className="brand-mark" aria-hidden="true">TF</span>
            <span>TeamFlow</span>
          </div>
          <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((v) => !v)}>
            Menu
          </button>
          <ul id="nav-links" className={open ? 'nav-links open' : 'nav-links'}>
            {NAV.map(([href, label]) => (
              <li key={href}><a href={href} onClick={close}>{label}</a></li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="overview">
          <div className="panel">
            <p className="eyebrow">Web Project Management and Bug Tracking System</p>
            <h1>One secure workspace for tasks, bugs, teams, and delivery</h1>
            <p className="lead">
              TeamFlow replaces scattered WhatsApp messages and lost voice-note bug reports with a central
              system where teams create projects, break work into tasks, assign owners, report bugs, and
              track progress to completion. Everyone sees the same live picture, with history for what
              changed, who changed it, and why.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#modules">Explore Modules</a>
              <a className="btn btn-accent" href="#security">View Security</a>
            </div>
            <div className="notice">
              Palette: primary <code>#1F8A70</code>, headers/text <code>#0E3B36</code>, accent <code>#F2A33A</code>,
              background <code>#E9F3EF</code>, error <code>#C4533A</code>. This landing page is a React app served by
              an Express server with Helmet, CSP, rate limiting, compression, and secure response headers.
            </div>
          </div>
          <aside className="panel summary" aria-label="System summary">
            <h2>At a Glance</h2>
            <dl>
              <dt>Users</dt><dd>Students and small development teams.</dd>
              <dt>Core value</dt><dd>Visible ownership, deadlines, bug history, and team progress.</dd>
              <dt>Views</dt><dd>Dashboard, Kanban, task/bug cards, bug report form, team page, activity log.</dd>
              <dt>Roles</dt><dd>Project manager, developer, tester; permissions enforced per project.</dd>
              <dt>Workflow</dt><dd><span className="status todo">To Do</span> <span className="status progress">In Progress</span> <span className="status testing">Testing</span> <span className="status done">Done</span></dd>
              <dt>Data</dt><dd>Users, projects, memberships, tasks, bugs, comments, attachments, activity.</dd>
            </dl>
          </aside>
        </section>

        <section className="section" id="problem">
          <h2>Problem and Solution</h2>
          <div className="grid two">
            <article className="card">
              <h3>The Problem</h3>
              <ul className="clean">
                <li>Student and small dev teams manage work through WhatsApp messages.</li>
                <li>Tasks get forgotten and nobody knows who is doing what.</li>
                <li>Bugs are reported in voice notes and then lost.</li>
                <li>Team leaders cannot see overall progress and deadlines are missed.</li>
                <li>There is no history of what was changed, by whom, and why.</li>
              </ul>
            </article>
            <article className="card">
              <h3>The Solution</h3>
              <ul className="clean">
                <li>Central workspace for projects, tasks, assignments, and bug tracking.</li>
                <li>Live shared view through dashboard metrics and Kanban status.</li>
                <li>Structured bug reports with reproduction steps and evidence.</li>
                <li>Comments, attachments, notifications, and activity history.</li>
                <li>Role-based access per project and REST API support for integrations.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section" id="modules">
          <h2>Core Modules</h2>
          <div className="grid">
            <article className="card"><h3>Authentication &amp; Per-Project Roles</h3><p>Secure login/registration, session/token handling, password hashing, and role checks. Roles: project manager, developer, tester. Access is scoped to project membership.</p></article>
            <article className="card"><h3>Project &amp; Team Management</h3><p>Create projects, invite/manage members, assign roles, and define ownership. Team page lists members and responsibilities for accountability.</p></article>
            <article className="card"><h3>Task &amp; Bug Management</h3><p>CRUD for tasks and bugs with title, description, priority/severity, assignee, deadline, status workflow, and attachments/screenshots.</p></article>
            <article className="card"><h3>Kanban Board</h3><p>Drag-and-drop board with columns such as To Do, In Progress, Testing, Done. AJAX/API updates persist moves and create activity entries.</p></article>
            <article className="card"><h3>Comments, Attachments, Notifications</h3><p>Threaded discussion on cards, screenshot/file uploads with validation, and in-app or email notifications for assignments, mentions, and status changes.</p></article>
            <article className="card"><h3>Reports, Charts &amp; REST API</h3><p>Dashboard charts for tasks done vs pending and bugs by priority. Activity log captures change history. REST API supports clients and optional GitHub integration.</p></article>
          </div>
        </section>

        <section className="section" id="views">
          <h2>Product Views</h2>
          <div className="grid two">
            <article className="card"><h3>Dashboard</h3><p>Shows your projects, tasks due soon, and charts: tasks done vs pending, bugs by priority. Team leaders get a live progress snapshot.</p></article>
            <article className="card"><h3>Kanban Board</h3><p>Columns: <span className="status todo">To Do</span>, <span className="status progress">In Progress</span>, <span className="status testing">Testing</span>, <span className="status done">Done</span>. Cards move by drag-and-drop with server-side authorization.</p></article>
            <article className="card"><h3>Task/Bug Card</h3><p>Title, description, priority (low to critical), assignee, deadline, attachments/screenshots, and comment thread. Every status change is auditable.</p></article>
            <article className="card"><h3>Bug Report Form</h3><p>Captures steps to reproduce, expected result, actual result, severity, and screenshot upload. Structured reports prevent lost context.</p></article>
            <article className="card"><h3>Team Page</h3><p>Lists project members and roles: project manager, developer, tester. Supports clear ownership and controlled access.</p></article>
            <article className="card"><h3>Activity Log</h3><p>Records events such as: <code>Alice moved Task #12 to Done at 14:30.</code> Includes actor, entity, action, timestamp, and relevant metadata.</p></article>
          </div>
        </section>

        <section className="section" id="workflow">
          <h2>Status and Bug Workflow</h2>
          <div className="table-wrap">
            <table>
              <caption>Typical workflow states and controls</caption>
              <thead><tr><th>Entity</th><th>States</th><th>Key Fields</th><th>Security/Validation</th></tr></thead>
              <tbody>
                <tr><td>Task</td><td>To Do, In Progress, Testing, Done</td><td>Title, description, priority, assignee, deadline, attachments, comments</td><td>Project membership check, allowed status transitions, input sanitization, CSRF/session or token auth.</td></tr>
                <tr><td>Bug</td><td>Open, In Progress, Testing, Resolved/Done</td><td>Steps to reproduce, expected vs actual, severity, priority, assignee, screenshot</td><td>Required reproduction details, file type/size validation, role-based assignment, audit log entry.</td></tr>
                <tr><td>Comment</td><td>Active/edit history as policy allows</td><td>Author, body, timestamp, card reference</td><td>Escape output, rate limit posting, authorize project access.</td></tr>
                <tr><td>Attachment</td><td>Uploaded, linked, removable by authorized user</td><td>Filename, MIME type, size, uploader, storage path/reference</td><td>Allowlist file types, scan policy where available, random stored names, no direct execution, size limits.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" id="api">
          <h2>REST API (Design Overview)</h2>
          <div className="grid two">
            <article className="card">
              <h3>Representative Endpoints</h3>
              <pre><code>{`POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PATCH  /api/tasks/:id/status
POST   /api/projects/:id/bugs
POST   /api/cards/:id/comments
POST   /api/cards/:id/attachments
GET    /api/projects/:id/activity
GET    /api/projects/:id/reports`}</code></pre>
            </article>
            <article className="card">
              <h3>API Security Controls</h3>
              <ul className="clean">
                <li>Authenticate every protected request (secure session cookie or signed token).</li>
                <li>Authorize by project membership and role before reads/writes.</li>
                <li>Validate and normalize input; reject unknown/invalid fields.</li>
                <li>Apply rate limits to auth, comments, uploads, and status updates.</li>
                <li>Use parameterized queries/ORM and safe file handling.</li>
                <li>Log security-relevant events and return generic auth errors.</li>
                <li>Optional GitHub integration should use scoped credentials and webhooks/signature checks.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section" id="security">
          <h2>Security Enforcement</h2>
          <div className="grid">
            <article className="card"><h3>Transport &amp; Headers</h3><p>Express server uses Helmet with CSP, frame protection, referrer policy, and HSTS settings. It disables <code>x-powered-by</code>, sets permissions policy, and serves with <code>X-Content-Type-Options: nosniff</code>.</p></article>
            <article className="card"><h3>Authentication &amp; Sessions</h3><p>Use strong password hashing, secure HttpOnly/SameSite cookies or tokens, session expiry/rotation, CSRF protection for cookie-auth forms, and account lockout/rate limiting on login.</p></article>
            <article className="card"><h3>Authorization</h3><p>Every task, bug, comment, attachment, and report action must verify project membership and role. Never trust client-side role checks.</p></article>
            <article className="card"><h3>Input &amp; Output Safety</h3><p>Validate forms and API payloads, enforce file allowlists/sizes, sanitize rich text if used, escape rendered output, and use parameterized database access.</p></article>
            <article className="card"><h3>Abuse Controls</h3><p>Rate limiting is enabled on the landing server and should also protect auth, uploads, comments, and drag-and-drop status endpoints in the full app.</p></article>
            <article className="card"><h3>Auditability</h3><p>Activity log records who changed what and when. Production deployments should add immutable/security logging, monitoring, backups, and least-privilege secrets management.</p></article>
          </div>
          <div className="callout notice error-note">
            <strong>Error color usage:</strong> validation and failure states should use <code>#C4533A</code> with clear, non-sensitive messages (for example, “Could not save task” or “Invalid file type”).
          </div>
        </section>

        <section className="section" id="data">
          <h2>Data Model</h2>
          <div className="table-wrap">
            <table>
              <caption>Core database relations</caption>
              <thead><tr><th>Table/Collection</th><th>Important Fields</th><th>Relations</th></tr></thead>
              <tbody>
                <tr><td>users</td><td>id, name, email, password_hash, created_at</td><td>Has memberships, assigned tasks/bugs, comments, activity entries.</td></tr>
                <tr><td>projects</td><td>id, name, description, owner/creator, created_at</td><td>Has memberships, tasks, bugs, activity log.</td></tr>
                <tr><td>project_members</td><td>project_id, user_id, role</td><td>Many-to-many between users and projects with role: manager/developer/tester.</td></tr>
                <tr><td>tasks</td><td>id, project_id, title, description, priority, status, assignee_id, deadline</td><td>Belongs to project; may have comments, attachments, activity.</td></tr>
                <tr><td>bugs</td><td>id, project_id, title, steps_to_reproduce, expected, actual, severity, status, assignee_id</td><td>Belongs to project; may have comments, attachments, activity.</td></tr>
                <tr><td>comments</td><td>id, entity_type/id, author_id, body, created_at</td><td>Belongs to a task/bug and author.</td></tr>
                <tr><td>attachments</td><td>id, entity_type/id, uploader_id, original_name, stored_name, mime, size</td><td>Belongs to task/bug; stored with safe file handling.</td></tr>
                <tr><td>activity_log</td><td>id, project_id, actor_id, action, entity, metadata, created_at</td><td>Immutable-style history of project changes.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" id="run">
          <h2>Run on Server</h2>
          <div className="grid two">
            <article className="card">
              <h3>Development</h3>
              <pre><code>{`cd landing-page
npm install
npm run dev`}</code></pre>
              <p>Starts Vite dev server for the React landing page.</p>
            </article>
            <article className="card">
              <h3>Production-Style Server</h3>
              <pre><code>{`cd landing-page
npm install
npm run build
npm start`}</code></pre>
              <p>Builds React into <code>dist/</code> and serves it with Express on <code>http://localhost:4173</code> (or <code>PORT</code>). Includes <code>/health</code>.</p>
            </article>
          </div>
          <div className="callout">
            <strong>Database note:</strong> this landing page documents the full system and runs on an Express server. The full TeamFlow application data layer (users, projects, tasks, bugs, comments, activity) is intended to run on a server-side database (commonly MongoDB/Mongoose or a relational DB) behind authenticated REST APIs. MongoDB connections must use a protected <code>MONGO_URI</code> environment variable and never be exposed to browser code.
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>TeamFlow landing page — React UI, secure Express static server, and complete system overview.</p>
      </footer>
    </div>
  );
}
