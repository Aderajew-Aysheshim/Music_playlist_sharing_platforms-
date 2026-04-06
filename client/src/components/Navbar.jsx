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
    subtitle: 'Tracks, playlists, and quick actions.',
  },
  '/browse': {
    title: 'Browse',
    subtitle: 'Public playlists from the community.',
  },
  '/playlists': {
    title: 'Library',
    subtitle: 'Your playlists and collaborations.',
  },
  '/upload': {
    title: 'Upload',
    subtitle: 'Add a new track.',
  },
};

function Navbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const token = hasStoredAccessToken();
  const user = getStoredUser();

  const pageDetails = useMemo(
    () => pageMeta[location.pathname] || {
      title: 'MusiConnect',
      subtitle: 'Playlist sharing and discovery.',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {children}
        <div>
          <p className="section-kicker">{pageDetails.title}</p>
          <h1 className="topbar-title">{pageDetails.title}</h1>
          <p className="topbar-subtitle">{pageDetails.subtitle}</p>
        </div>
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
              </div>
            </div>
            <button className="btn-secondary compact" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <div className="auth-strip">
            <div className="auth-message">
              <Sparkles size={16} />
              <span>Sign in to manage your library.</span>
            </div>
            <Link to="/login" className="btn-secondary compact">Login</Link>
            <Link to="/register" className="btn-primary compact">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
