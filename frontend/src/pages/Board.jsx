import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSocket } from '../context/SocketContext';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Column from '../components/Column';
import { Plus, X, Tag, Share2, Activity, Users, MessageSquare, Settings } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../context/ThemeContext';

const Board = () => {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [board, setBoard] = useState(null);
  const [offlineBoard, setOfflineBoard, isOnline] = useOfflineStorage(`board_${id}`, null);
  const [modalState, setModalState] = useState({ type: null, task: null, columnId: null, columnTitle: '' });
  const [showActivity, setShowActivity] = useState(false);
  
  // Add Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Edit Task State
  const [editInput, setEditInput] = useState('');
  const [editDeadlineInput, setEditDeadlineInput] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [editLabels, setEditLabels] = useState([]);
  const [editAssignees, setEditAssignees] = useState([]);
  const [editComments, setEditComments] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ef4444');
  const [newComment, setNewComment] = useState('');

  // Column / Board State
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [bgInput, setBgInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBoard();
    if (socket) {
      socket.emit('joinBoard', id);
      socket.on('boardUpdated', (updatedBoard) => {
        setBoard(updatedBoard);
        setOfflineBoard(updatedBoard);
      });
    }
    return () => {
      if (socket) {
        socket.emit('leaveBoard', id);
        socket.off('boardUpdated');
      }
    };
  }, [id, socket]);

  useEffect(() => {
    if (!isOnline && offlineBoard) {
      setBoard(offlineBoard);
    }
    if (isOnline && offlineBoard && board && offlineBoard.version > board.version) {
      updateBoardBackend(offlineBoard.tasks, offlineBoard.version, offlineBoard.columns, offlineBoard.background);
    }
  }, [isOnline]);

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/boards/${id}`);
      setBoard(res.data);
      setOfflineBoard(res.data);
    } catch (error) {
      if (!isOnline && offlineBoard) setBoard(offlineBoard);
      console.error('Failed to fetch board', error);
    }
  };

  const updateBoardBackend = async (tasks, version, columns, background) => {
    try {
      const payload = { tasks, version };
      if (columns) payload.columns = columns;
      if (background !== undefined) payload.background = background;
      
      const res = await axios.put(`http://localhost:5001/api/boards/${id}`, payload);
      setBoard(res.data);
      setOfflineBoard(res.data);
    } catch (error) {
      if (error.response?.status === 409) {
        alert('Conflict detected! Someone else updated the board. Fetching latest changes.');
        fetchBoard();
      } else {
        console.error('Failed to update board', error);
      }
    }
  };

  const boardColumns = board?.columns?.length ? board.columns : [
    { id: 'To Do', title: 'To Do' },
    { id: 'Doing', title: 'Doing' },
    { id: 'Done', title: 'Done' }
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeTaskIndex = board.tasks.findIndex(t => (t._id || t.id) === active.id);
      let newStatus = over.id; 
      
      if (!boardColumns.find(c => c.id === newStatus)) {
         const overTask = board.tasks.find(t => (t._id || t.id) === over.id);
         if (overTask) newStatus = overTask.status;
      }

      if (activeTaskIndex !== -1) {
        const newTasks = [...board.tasks];
        newTasks[activeTaskIndex].status = newStatus;
        
        const newBoardState = { ...board, tasks: newTasks, version: board.version };
        
        setBoard(newBoardState);
        setOfflineBoard(newBoardState); 
        
        if (isOnline) {
          updateBoardBackend(newTasks, board.version, board.columns, board.background);
        }
      }
    }
  };

  // --- Task Operations ---
  const openAddModal = () => {
    setNewTaskTitle('');
    setNewTaskDeadline('');
    setModalState({ type: 'add' });
  };

  const confirmAdd = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const firstColId = boardColumns[0].id;
    const newTask = { id: Date.now().toString(), title: newTaskTitle, status: firstColId, deadline: newTaskDeadline, assignees: [], comments: [] };
    const newTasks = [...(board?.tasks || []), newTask];
    
    const newBoardState = { ...board, tasks: newTasks };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(newTasks, board.version, board.columns, board.background);
    setModalState({ type: null, task: null });
  };

  const openEditModal = (task) => {
    setEditInput(task.title);
    setEditDescription(task.description || '');
    setEditSubtasks(task.subtasks || []);
    setEditLabels(task.labels || []);
    setEditAssignees(task.assignees || []);
    setEditComments(task.comments || []);
    
    let formattedDeadline = '';
    if (task.deadline) {
      const d = new Date(task.deadline);
      if (!isNaN(d.getTime())) {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        formattedDeadline = (new Date(d - tzoffset)).toISOString().slice(0, 16);
      }
    }
    setEditDeadlineInput(formattedDeadline);
    setModalState({ type: 'edit', task });
  };

  const openDeleteModal = (task) => {
    setModalState({ type: 'delete', task });
  };

  const confirmEdit = (e) => {
    e.preventDefault();
    if (!editInput || editInput.trim() === '') return;
    
    const newTasks = board.tasks.map(t => (t._id === modalState.task._id && t.id === modalState.task.id) ? { ...t, title: editInput, deadline: editDeadlineInput, description: editDescription, subtasks: editSubtasks, labels: editLabels, assignees: editAssignees, comments: editComments } : t);
    const newBoardState = { ...board, tasks: newTasks };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(newTasks, board.version, board.columns, board.background);
    setModalState({ type: null, task: null });
  };

  const confirmDelete = () => {
    const newTasks = board.tasks.filter(t => t._id !== modalState.task._id || t.id !== modalState.task.id);
    const newBoardState = { ...board, tasks: newTasks };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(newTasks, board.version, board.columns, board.background);
    setModalState({ type: null, task: null });
  };

  // --- Subtask / Label / Comment Operations ---
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setEditSubtasks([...editSubtasks, { title: newSubtaskTitle, isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (index) => {
    const updated = [...editSubtasks];
    updated[index].isCompleted = !updated[index].isCompleted;
    setEditSubtasks(updated);
  };

  const removeSubtask = (index) => {
    setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
  };

  const addLabel = () => {
    if (!newLabelName.trim()) return;
    setEditLabels([...editLabels, { name: newLabelName, color: newLabelColor }]);
    setNewLabelName('');
  };

  const removeLabel = (index) => {
    setEditLabels(editLabels.filter((_, i) => i !== index));
  };

  const toggleAssignee = (userObj) => {
    if (editAssignees.some(a => a._id === userObj._id)) {
      setEditAssignees(editAssignees.filter(a => a._id !== userObj._id));
    } else {
      setEditAssignees([...editAssignees, userObj]);
    }
  };

  const addComment = () => {
    if (!newComment.trim() || !user) return;
    const commentObj = {
      _id: Date.now().toString(),
      text: newComment,
      user: { _id: user.id, name: user.name, username: user.username },
      createdAt: new Date().toISOString()
    };
    setEditComments([...editComments, commentObj]);
    setNewComment('');
  };

  const handleShare = () => {
    const link = `http://localhost:5173/invite/${board.inviteToken}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  // --- Column Operations ---
  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const newColumns = [...boardColumns, { id: `col-${Date.now()}`, title: newColumnTitle }];
    const newBoardState = { ...board, columns: newColumns };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(board.tasks, board.version, newColumns, board.background);
    setModalState({ type: null });
  };

  const handleRenameColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const newColumns = boardColumns.map(c => c.id === modalState.columnId ? { ...c, title: newColumnTitle } : c);
    const newBoardState = { ...board, columns: newColumns };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(board.tasks, board.version, newColumns, board.background);
    setModalState({ type: null });
  };

  const handleDeleteColumn = () => {
    const newColumns = boardColumns.filter(c => c.id !== modalState.columnId);
    // Delete all tasks in that column
    const newTasks = board.tasks.filter(t => t.status !== modalState.columnId);
    const newBoardState = { ...board, columns: newColumns, tasks: newTasks };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(newTasks, board.version, newColumns, board.background);
    setModalState({ type: null });
  };

  // --- Background Operations ---
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const newBoardState = { ...board, background: bgInput };
    setBoard(newBoardState);
    setOfflineBoard(newBoardState);
    if (isOnline) updateBoardBackend(board.tasks, board.version, board.columns, bgInput);
    setModalState({ type: null });
  };

  const getBackgroundStyle = (bg) => {
    if (!bg) return { background: 'var(--color-bg)' };
    if (bg.startsWith('http')) return { background: `url(${bg}) center/cover no-repeat fixed` };
    return { background: bg };
  };

  if (!board) return <div>Loading...</div>;

  const allMembers = [board.owner, ...(board.members || [])].filter(Boolean).filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i);

  return (
    <div className="app-container" style={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh', ...getBackgroundStyle(board.background) }}>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap', background: 'var(--color-surface)', border: '1px solid var(--color-border)', backdropFilter: 'blur(16px)', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ margin: 0, color: 'var(--color-text)' }}>{board.name} {!isOnline && <span style={{ color: '#f87171', fontSize: '0.9rem' }}>(Offline Mode)</span>}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
              {allMembers.slice(0, 3).map((m, i) => (
                <div key={i} className="avatar-small" style={{ marginLeft: i > 0 ? '-10px' : 0, zIndex: 10 - i }} title={m.name}>
                  {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                </div>
              ))}
              {allMembers.length > 3 && <div className="avatar-small" style={{ marginLeft: '-10px', zIndex: 1 }}>+{allMembers.length - 3}</div>}
            </div>
            <button onClick={handleShare} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <Share2 size={16} /> Share
            </button>
            <button onClick={() => setShowActivity(!showActivity)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <Activity size={16} /> Activity
            </button>
            <button onClick={() => { setBgInput(board.background || ''); setModalState({ type: 'settings' }); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <Settings size={16} /> Settings
            </button>
            <button onClick={openAddModal} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        <div className="board-columns-container" style={{ display: 'flex', gap: '2rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {boardColumns.map(col => (
              <Column 
                key={col.id}
                id={col.id}
                title={col.title} 
                tasks={board.tasks.filter(t => t.status === col.id || t.status === col.title)} 
                onEditTask={openEditModal} 
                onDeleteTask={openDeleteModal} 
                onRenameColumn={(id, title) => { setNewColumnTitle(title); setModalState({ type: 'renameColumn', columnId: id, columnTitle: title }); }}
                onDeleteColumn={(id) => setModalState({ type: 'deleteColumn', columnId: id })}
              />
            ))}
            <div className="add-column-container" onClick={() => { setNewColumnTitle(''); setModalState({ type: 'addColumn' }); }}>
              <Plus size={24} /> Add Column
            </div>
          </DndContext>
        </div>
      </main>

      {/* Activity Sidebar */}
      <div className={`activity-sidebar ${showActivity ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-light)' }}>Activity Log</h3>
          <button onClick={() => setShowActivity(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}><X size={20}/></button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {board.activityLog && board.activityLog.length > 0 ? (
            board.activityLog.slice().reverse().map((log, i) => (
              <div key={i} style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>{log.user?.name || 'Someone'}</span> {log.action}
                <div style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>No activity yet.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      
      {/* Column Modals */}
      <Modal isOpen={modalState.type === 'addColumn'} onClose={() => setModalState({ type: null })} title="Add Column">
        <form onSubmit={handleAddColumn}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Column Title</label>
          <input autoFocus type="text" className="input-field" value={newColumnTitle} onChange={e => setNewColumnTitle(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalState({ type: null })} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn">Add</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalState.type === 'renameColumn'} onClose={() => setModalState({ type: null })} title="Rename Column">
        <form onSubmit={handleRenameColumn}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Column Title</label>
          <input autoFocus type="text" className="input-field" value={newColumnTitle} onChange={e => setNewColumnTitle(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalState({ type: null })} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalState.type === 'deleteColumn'} onClose={() => setModalState({ type: null })} title="Delete Column">
        <p style={{ color: '#f87171', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          Warning: Deleting this column will also delete ALL tasks within it!
        </p>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          Are you sure you want to proceed?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => setModalState({ type: null })} className="btn btn-outline">Cancel</button>
          <button onClick={handleDeleteColumn} className="btn-logout">Delete Column & Tasks</button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={modalState.type === 'settings'} onClose={() => setModalState({ type: null })} title="Board Settings">
        <form onSubmit={handleSaveSettings}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Background (URL or HEX Code)</label>
          <input type="text" className="input-field" placeholder="e.g. #3b82f6 or https://image.url" value={bgInput} onChange={e => setBgInput(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
             <button type="button" onClick={() => setBgInput('')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>Default</button>
             <button type="button" onClick={() => setBgInput('#020617')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', background: '#020617', color: 'white' }}>Dark Slate</button>
             <button type="button" onClick={() => setBgInput('radial-gradient(circle at top right, #1e3a8a, #020617)')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', background: 'linear-gradient(90deg, #1e3a8a, #020617)', color: 'white' }}>Deep Space</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalState({ type: null })} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn">Save Settings</button>
          </div>
        </form>
      </Modal>

      {/* Task Modals (Add, Edit, Delete remain same structure as before) */}
      <Modal isOpen={modalState.type === 'add'} onClose={() => setModalState({ type: null, task: null })} title="Add New Task">
        <form onSubmit={confirmAdd}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Task Title</label>
          <input autoFocus type="text" className="input-field" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Deadline (Optional)</label>
          <input type="datetime-local" className="input-field" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalState({ type: null, task: null })} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn">Add Task</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalState.type === 'edit'} onClose={() => setModalState({ type: null, task: null })} title="Edit Task" className="large-modal">
        <form onSubmit={confirmEdit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Task Title</label>
          <input autoFocus type="text" className="input-field" value={editInput} onChange={e => setEditInput(e.target.value)} style={{ padding: '0.5rem', marginBottom: '1rem' }} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><Users size={14}/> Assignees</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {allMembers.map(m => (
                  <div key={m._id} onClick={() => toggleAssignee(m)} className={`assignee-pill ${editAssignees.some(a => a._id === m._id) ? 'selected' : ''}`}>
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Deadline</label>
              <input type="datetime-local" className="input-field" value={editDeadlineInput} onChange={e => setEditDeadlineInput(e.target.value)} style={{ padding: '0.5rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
             <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><Tag size={14}/> Labels</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {editLabels.map((l, i) => (
                  <span key={i} className="label-pill" style={{ backgroundColor: l.color, cursor: 'pointer' }} onClick={() => removeLabel(i)} title="Click to remove">
                    {l.name} <X size={10} style={{ display: 'inline' }}/>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <input type="color" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} style={{ width: '30px', height: '30px', padding: 0, border: 'none', borderRadius: '4px' }} />
                <input type="text" className="input-field" placeholder="New label" value={newLabelName} onChange={e => setNewLabelName(e.target.value)} style={{ marginBottom: 0, padding: '0.25rem 0.5rem' }} />
                <button type="button" className="btn" onClick={addLabel} style={{ padding: '0.25rem 0.5rem' }}>Add</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Subtasks</label>
              <div className="subtask-list" style={{ marginTop: 0 }}>
                {editSubtasks.map((st, i) => (
                  <div key={i} className={`subtask-item ${st.isCompleted ? 'completed' : ''}`} style={{ padding: '0.25rem' }}>
                    <input type="checkbox" checked={st.isCompleted} onChange={() => toggleSubtask(i)} />
                    <span style={{ flex: 1, fontSize: '0.85rem' }}>{st.title}</span>
                    <button type="button" onClick={() => removeSubtask(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input type="text" className="input-field" placeholder="Add subtask..." value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} style={{ marginBottom: 0, padding: '0.25rem' }} />
                  <button type="button" className="btn" onClick={addSubtask} style={{ padding: '0.25rem 0.5rem' }}>Add</button>
                </div>
              </div>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
          <div style={{ marginBottom: '1rem' }} data-color-mode={theme}>
            <MDEditor value={editDescription} onChange={setEditDescription} height={150} />
          </div>
          
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><MessageSquare size={14}/> Comments</label>
          <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
            {editComments.map(c => (
              <div key={c._id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>{c.user?.name} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>{new Date(c.createdAt).toLocaleString()}</span></div>
                <div style={{ fontSize: '0.9rem' }}>{c.text}</div>
              </div>
            ))}
            {editComments.length === 0 && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No comments yet.</div>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" className="input-field" placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ marginBottom: 0 }} />
            <button type="button" className="btn" onClick={addComment}>Send</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalState({ type: null, task: null })} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>Cancel</button>
            <button type="submit" className="btn" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null, task: null })} title="Delete Task">
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete the task "{modalState.task?.title}"? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => setModalState({ type: null, task: null })} className="btn btn-outline">Cancel</button>
          <button onClick={confirmDelete} className="btn-logout">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Board;
