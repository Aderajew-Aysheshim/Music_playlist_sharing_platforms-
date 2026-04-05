import { Compass, Home, Library, Music2, Radio, UploadCloud, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getStoredUser, hasStoredAccessToken } from '../utils/session';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Compass },
  { to: '/playlists', label: 'Library', icon: Library, authOnly: true },
  { to: '/upload', label: 'Upload', icon: UploadCloud, authOnly: true },
];

function Sidebar({ className = '', onClose }) {
  const isAuthenticated = hasStoredAccessToken();
  const user = getStoredUser();

  return (
    <aside className={`app-sidebar ${className}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Music2 size={22} />
        </div>
        <div>
          <h1>MusiConnect</h1>
        </div>
        {onClose && (
          <button className="mobile-menu-toggle" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => !item.authOnly || isAuthenticated)
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-panel">
        <div className="sidebar-panel-icon">
          <Radio size={18} />
        </div>
        <div>
          <h2>Share & Discover</h2>
          <p>Public playlists, comments, and likes</p>
        </div>
      </div>

      <div className="sidebar-user">
        <span className="sidebar-user-label">Current session</span>
        {isAuthenticated && user ? (
          <>
            <strong>{user.username}</strong>
            <span>Logged in</span>
          </>
        ) : (
          <>
            <strong>Guest mode</strong>
            <span>Sign in to manage playlists</span>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
