import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>My Boards</h2>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
