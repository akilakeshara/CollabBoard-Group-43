import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="nav-glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 5%', alignItems: 'center' }}>
      <Link to={user ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <span className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CollabBoard</span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={toggleTheme} 
          className="btn-outline" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '0.5rem', 
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            border: 'none',
            background: 'var(--glass-bg)',
            color: 'var(--color-primary-light)'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text)' }}>Hello, {user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{user.username}</span>
              </div>
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <button onClick={logout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <LogOut size={16} /> <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
