import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkStyle = {
  display: 'block',
  padding: '0.6rem 1rem',
  textDecoration: 'none',
  color: '#334155',
  borderRadius: 4,
};

const activeLinkStyle = {
  ...linkStyle,
  background: '#e2e8f0',
  fontWeight: 'bold' as const,
};

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <aside style={{
      width: 200,
      minHeight: 'calc(100vh - 52px)',
      background: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      padding: '1rem 0.5rem',
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/expenses"
          style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
        >
          💰 Expenses
        </NavLink>

        <NavLink
          to="/budgets"
          style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
        >
          📋 Budgets
        </NavLink>

        {role === 'ADMIN' && (
          <NavLink
            to="/categories"
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
          >
            ⚙️ Categories
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
