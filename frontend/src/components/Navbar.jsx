import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="nav-glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 5%', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
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
      </div>
    </nav>
  );
};

export default Navbar;
