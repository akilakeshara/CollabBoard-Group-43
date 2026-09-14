import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/boards');
      setBoards(res.data);
    } catch (error) {
      console.error('Failed to fetch boards', error);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const res = await axios.post('http://localhost:5001/api/boards', { name: newBoardName });
      setBoards([...boards, res.data]);
      setNewBoardName('');
    } catch (error) {
      console.error('Failed to create board', error);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>My Boards</h2>
          <form onSubmit={createBoard} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: 0, minWidth: '300px', borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', background: 'var(--glass-input)' }} 
              placeholder="New Board Name..." 
              value={newBoardName} 
              onChange={e => setNewBoardName(e.target.value)} 
            />
            <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem' }}>
              <Plus size={18} /> Create
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {boards.map((board, index) => (
            <div 
              key={board._id} 
              onClick={() => navigate(`/board/${board._id}`)} 
              className="board-card" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 style={{ paddingRight: '5rem', fontSize: '1.5rem', fontWeight: '700' }}>{board.name}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Tasks: {board.tasks?.length || 0}</p>
            </div>
          ))}
          {boards.length === 0 && <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>No boards found. Create one to get started!</p>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
