export default function Hero() {
  return (
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
  );
}
