import { Link, useNavigate } from 'react-router-dom';
import { Music, LogOut, User, Menu, Upload as UploadIcon } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="glass-panel" style={{ padding: '1rem', margin: '1rem', borderRadius: '1rem' }}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Music size={28} />
          MusiConnect
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              <Link to="/upload" className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <UploadIcon size={18} />
                Upload
              </Link>
              <Link to="/playlists" className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Music size={18} />
                My Playlists
              </Link>
              <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <User size={18} />
                {user?.username}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
