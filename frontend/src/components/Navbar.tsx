import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout, role } = useAuth();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      background: '#1e293b',
      color: '#fff',
    }}>
      <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
        SEBMS
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Role: {role}
        </span>
        <button
          onClick={logout}
          style={{
            padding: '0.4rem 1rem',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
