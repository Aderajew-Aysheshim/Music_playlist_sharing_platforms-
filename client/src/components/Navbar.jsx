import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, LogOut, User, Upload as UploadIcon, ListMusic, Search } from 'lucide-react';
import api from '../api/axios';

function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('logout/', { refresh: refreshToken });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="glass-panel" style={{ padding: '0.75rem 1.5rem', margin: '1rem', borderRadius: '1rem' }}>
      <div className="container flex justify-between items-center gap-8">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0 }}>
          <Music size={28} />
          <span className="hidden sm:inline">MusiConnect</span>
        </Link>

        {/* Professional Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                color: 'var(--text-muted)',
                pointerEvents: 'none' 
              }} 
            />
            <input
              type="text"
              placeholder="Search for vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                borderRadius: '2rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link to="/browse" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <ListMusic size={18} />
            Browse
          </Link>

          {token ? (
            <>
              <Link to="/upload" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <UploadIcon size={18} />
                Upload
              </Link>
              <Link to="/playlists" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <Music size={18} />
                Playlists
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <User size={16} />
                {user?.username}
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;