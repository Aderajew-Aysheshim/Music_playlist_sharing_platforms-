import {
  LogOut,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

import api from '../api/axios';
import { getStoredUser, hasStoredAccessToken } from '../utils/session';

const pageMeta = {
  '/': {
    title: 'Home',
    subtitle: 'Fresh uploads, playlist highlights, and fast entry points into the app.',
  },
  '/browse': {
    title: 'Browse',
    subtitle: 'Public playlists from the community, now with comments and likes.',
  },
  '/playlists': {
    title: 'Library',
    subtitle: 'Manage your playlists, collaborators, visibility, comments, and share links.',
  },
  '/upload': {
    title: 'Upload',
    subtitle: 'Publish songs with artwork and synced lyrics for playback mode.',
  },
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const token = hasStoredAccessToken();
  const user = getStoredUser();

  const pageDetails = useMemo(
    () => pageMeta[location.pathname] || {
      title: 'MusiConnect',
      subtitle: 'Playlist sharing, collaboration, and music discovery in one place.',
    },
    [location.pathname],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/browse?search=${encodeURIComponent(query)}` : '/browse');
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="topbar">
      <div>
        <p className="section-kicker">{pageDetails.title}</p>
        <h1 className="topbar-title">{pageDetails.title}</h1>
        <p className="topbar-subtitle">{pageDetails.subtitle}</p>
      </div>

      <div className="topbar-actions">
        <form onSubmit={handleSearch} className="topbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search public playlists"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </form>

        {token && user ? (
          <>
            <div className="user-badge">
              <UserRound size={16} />
              <div>
                <strong>{user.username}</strong>
                <span>{user.email || 'Signed in'}</span>
              </div>
            </div>
            <button className="btn-secondary compact" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <div className="auth-strip">
            <div className="auth-message">
              <Sparkles size={16} />
              <span>Sign in to manage playlists, comments, and collaboration.</span>
            </div>
            <Link to="/login" className="btn-secondary compact">Login</Link>
            <Link to="/register" className="btn-primary compact">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
