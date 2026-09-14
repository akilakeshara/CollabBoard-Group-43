import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Zap } from 'lucide-react';

const Landing = () => {
  const { user, loading } = useAuth();

  // If already logged in, skip the landing page and go straight to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="app-container">
      <nav className="nav-glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 5%', alignItems: 'center' }}>
        <div className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CollabBoard</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn">Get Started</Link>
        </div>
      </nav>

      <main className="landing-hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 className="landing-title" style={{ fontSize: '4.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Manage Tasks, <br/> <span className="text-gradient">Together.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', maxWidth: '600px', marginBottom: '3.5rem', fontWeight: 400 }}>
          CollabBoard is the ultimate real-time Kanban tool for modern teams. Stay synced, stay organized, and work seamlessly—even offline.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '6rem' }}>
          <Link to="/register" className="btn" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Start for Free</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', width: '100%', maxWidth: '1100px' }}>
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ color: 'var(--color-primary-light)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Zap size={40} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Real-Time Sync</h3>
            <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>See your teammates' updates instantly as they happen.</p>
          </div>
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ color: 'var(--color-primary-light)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Users size={40} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Team Collaboration</h3>
            <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Create unlimited boards and manage tasks efficiently.</p>
          </div>
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ color: 'var(--color-primary-light)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                <LayoutDashboard size={40} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Offline Support</h3>
            <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Keep working when the internet drops. We'll sync automatically.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
