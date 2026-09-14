import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ padding: '3rem', borderRadius: '1.5rem' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Join CollabBoard</h2>
        {error && <div style={{ color: '#f87171', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
            <input className="input-field" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your name" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Username</label>
            <input className="input-field" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Choose a username" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Create a password" />
          </div>
          <button className="btn" style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem' }} type="submit">Register</button>
        </form>
        <div style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
