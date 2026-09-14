import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="nav-glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 5%', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <span className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CollabBoard</span>
      </Link>
    </nav>
  );
};

export default Navbar;
