import { Music2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('login/', formData);
      localStorage.setItem('accessToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 6px 24px rgba(34,212,101,0.30)',
            }}
          >
            <Music2 size={22} color="#041a0c" />
          </div>
          <h2>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Sign in to your MusiConnect account
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="ada"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button id="login-submit" type="submit" className="btn-primary" style={{ marginTop: '0.4rem', justifyContent: 'center', padding: '0.85rem' }}>
            Sign in
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
