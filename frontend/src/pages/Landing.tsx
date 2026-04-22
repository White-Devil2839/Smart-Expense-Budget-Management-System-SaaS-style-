import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 5%',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          SEB<span className="text-gradient">MS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        
        <div style={{
          padding: '0.5rem 1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '20px',
          color: '#60a5fa',
          fontWeight: 600,
          fontSize: '0.85rem',
          marginBottom: '2rem',
          display: 'inline-block'
        }}>
          ✨ Financial Freedom Starts Here
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', maxWidth: '800px', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Master Your Money with <br />
          <span className="text-gradient">Intelligent Tracking.</span>
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          SEBMS is the simplest way to track your expenses, set limits, and stay out of debt. 
          Get detailed breakdowns and never exceed a budget again.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
            Start Tracking Free
          </Link>
        </div>

        {/* Feature Highlights Component */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          width: '100%',
          marginTop: '5rem'
        }}>
          <FeatureCard 
            icon="📊" 
            title="Real-time Analytics" 
            desc="Visualize exactly where your money goes every month with beautiful breakdown charts."
          />
          <FeatureCard 
            icon="🎯" 
            title="Smart Budgets" 
            desc="Set category limits. We'll warn you before you overspend so you stay in control."
          />
          <FeatureCard 
            icon="🔒" 
            title="Secure & Private" 
            desc="Your financial data is encrypted. Role-based access ensures complete privacy."
          />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        © {new Date().getFullYear()} SEBMS. Built for modern finance management.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="card" style={{ textAlign: 'left', padding: '2rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  );
}
