import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Invite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=/invite/${token}`);
    } else if (user) {
      joinBoard();
    }
  }, [user, loading, token]);

  const joinBoard = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/boards/join/${token}`);
      if (res.data.boardId) {
        navigate(`/board/${res.data.boardId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join the board. The link might be invalid or expired.');
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '2rem' }}>
        <div className="auth-card glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
          <h2 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Joining Board...</h2>
          {error ? (
            <div>
              <p style={{ color: '#f87171', marginBottom: '1.5rem', fontWeight: 500 }}>{error}</p>
              <button className="btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>Please wait while we add you to the board.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Invite;
