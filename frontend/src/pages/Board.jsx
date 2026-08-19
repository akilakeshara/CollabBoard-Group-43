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

  