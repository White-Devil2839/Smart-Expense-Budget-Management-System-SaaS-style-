import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
