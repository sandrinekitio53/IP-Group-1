export default function Navbar({ items, open, onToggle, onClose }) {
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <div className="brand" aria-label="TeamFlow">
          <span className="brand-mark" aria-hidden="true">TF</span>
          <span>TeamFlow</span>
        </div>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={onToggle}
        >
          Menu
        </button>
        <ul id="nav-links" className={open ? 'nav-links open' : 'nav-links'}>
          {items.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={onClose}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
