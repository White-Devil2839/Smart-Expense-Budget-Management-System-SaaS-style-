import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (dashboard will be added next phase) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                  <h1>Dashboard</h1>
                  <p>You are logged in! Expense management coming in Phase 3.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
