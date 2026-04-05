import { Compass, Home, Library, Music2, Radio, UploadCloud } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getStoredUser, hasStoredAccessToken } from '../utils/session';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Compass },
  { to: '/playlists', label: 'Library', icon: Library, authOnly: true },
  { to: '/upload', label: 'Upload', icon: UploadCloud, authOnly: true },
];

function Sidebar() {
  const isAuthenticated = hasStoredAccessToken();
  const user = getStoredUser();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Music2 size={22} />
        </div>
        <div>
          <p className="sidebar-eyebrow">Music Playlist Sharing App</p>
          <h1>MusiConnect</h1>
        </div>
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
          <h2>Built for shared listening</h2>
          <p>
            Public playlists, share links, collaborators, comments, and likes all
            live here now.
          </p>
        </div>
      </div>

      <div className="sidebar-user">
        <span className="sidebar-user-label">Current session</span>
        {isAuthenticated && user ? (
          <>
            <strong>{user.username}</strong>
            <span>{user.email || 'Authenticated listener'}</span>
          </>
        ) : (
          <>
            <strong>Guest mode</strong>
            <span>Browse public playlists or sign in to manage your library.</span>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
