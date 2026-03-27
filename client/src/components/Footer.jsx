import { Music, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer style={{
      marginTop: '4rem',
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>MusiConnect</span>
      </div>
      <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Built with <Heart size={14} style={{ color: 'var(--secondary)' }} /> by the MusiConnect Team
      </p>
      <p>&copy; {new Date().getFullYear()} MusiConnect. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
