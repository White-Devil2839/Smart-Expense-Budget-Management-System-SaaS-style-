import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout, role } = useAuth();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/dashboard" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700 }}>
        SEB<span className="text-gradient">MS</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '0.4rem 0.8rem', 
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem', 
          color: 'var(--text-muted)' 
        }}>
          Role: <strong style={{ color: 'var(--accent-primary)' }}>{role}</strong>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
