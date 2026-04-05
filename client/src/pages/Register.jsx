import { Music2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('register/', formData);
      localStorage.setItem('accessToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError(
        Object.values(err.response?.data || {}).flat().join(', ') || 'Registration failed. Please try again.',
      );
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
          <h2>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Join MusiConnect and start sharing music
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="register-username"
              type="text"
              className="form-input"
              placeholder="ada"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button id="register-submit" type="submit" className="btn-primary" style={{ marginTop: '0.4rem', justifyContent: 'center', padding: '0.85rem' }}>
            Create account
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
