import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkStyle = {
  display: 'block',
  padding: '0.8rem 1.2rem',
  textDecoration: 'none',
  color: 'var(--text-muted)',
  borderRadius: '8px',
  transition: 'all 0.2s',
  marginBottom: '0.5rem',
  fontWeight: 500
};

const activeLinkStyle = {
  ...linkStyle,
  background: 'rgba(59, 130, 246, 0.1)',
  color: 'var(--accent-primary)',
  fontWeight: 600,
  borderRight: '3px solid var(--accent-primary)'
};

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1rem',
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/expenses" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          💰 Expenses
        </NavLink>

        <NavLink to="/budgets" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          📋 Budgets
        </NavLink>

        {role === 'ADMIN' && (
          <NavLink to="/categories" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
            ⚙️ Categories
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
