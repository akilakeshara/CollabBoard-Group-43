import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Dashboard = () => {
const navigate = useNavigate();
const [boards, setBoards] = useState([]);
const [newBoardName, setNewBoardName] = useState('');
const [modalState, setModalState] = useState({ type: null, board: null });
const [editInput, setEditInput] = useState('');

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

  const openDeleteModal = (board, e) => {
    e.stopPropagation();
    setModalState({ type: 'delete', board });
  };

  const openRenameModal = (board, e) => {
    e.stopPropagation();
    setEditInput(board.name);
    setModalState({ type: 'rename', board });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/boards/${modalState.board._id}`);
      setBoards(boards.filter(b => b._id !== modalState.board._id));
      setModalState({ type: null, board: null });
    } catch (error) {
      console.error('Failed to delete board', error);
    }
  };

  const confirmRename = async (e) => {
    e.preventDefault();
    if (!editInput || editInput.trim() === '' || editInput === modalState.board.name) {
      setModalState({ type: null, board: null });
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5001/api/boards/${modalState.board._id}/rename`, { name: editInput });
      setBoards(boards.map(b => (b._id === modalState.board._id ? res.data : b)));
      setModalState({ type: null, board: null });
    } catch (error) {
      console.error('Failed to rename board', error);
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
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button onClick={(e) => openRenameModal(board, e)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}>
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => openDeleteModal(board, e)} style={{ background: 'var(--glass-danger)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-danger-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-danger)'}>
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 style={{ paddingRight: '5rem', fontSize: '1.5rem', fontWeight: '700' }}>{board.name}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Tasks: {board.tasks?.length || 0}</p>
            </div>
          ))}
          {boards.length === 0 && <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>No boards found. Create one to get started!</p>}
        </div>
      </main>

      <Modal 
        isOpen={modalState.type === 'rename'} 
        onClose={() => setModalState({ type: null, board: null })} 
        title="Rename Board"
      >
        <form onSubmit={confirmRename}>
          <input 
            autoFocus
            type="text" 
            className="input-field" 
            value={editInput} 
            onChange={e => setEditInput(e.target.value)} 
            style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => setModalState({ type: null, board: null })} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>Cancel</button>
            <button type="submit" className="btn" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>Save</button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={modalState.type === 'delete'} 
        onClose={() => setModalState({ type: null, board: null })} 
        title="Delete Board"
      >
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Are you sure you want to delete the board <strong style={{ color: 'var(--color-text)' }}>"{modalState.board?.name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => setModalState({ type: null, board: null })} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>Cancel</button>
          <button onClick={confirmDelete} className="btn-logout" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
