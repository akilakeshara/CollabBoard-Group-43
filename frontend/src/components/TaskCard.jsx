import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, Clock, AlignLeft, CheckSquare, MessageSquare } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!task.deadline || task.status === 'Done') {
      setTimeLeft('');
      setIsOverdue(false);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(task.deadline) - new Date();
      if (difference <= 0) {
        setIsOverdue(true);
        const overTime = Math.abs(difference);
        const days = Math.floor(overTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((overTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((overTime / 1000 / 60) % 60);
        
        let timeStr = 'Overdue ';
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0) timeStr += `${hours}h `;
        if (days === 0 && hours === 0) timeStr += `${minutes}m`;
        setTimeLeft(timeStr);
      } else {
        setIsOverdue(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0) timeStr += `${hours}h `;
        if (days === 0 && hours === 0) timeStr += `${minutes}m`;
        setTimeLeft(timeStr);
      }
    };

    calculateTimeLeft(); // Run immediately
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute to save performance

    return () => clearInterval(timer);
  }, [task.deadline, task.status]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id || task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
    marginBottom: '1rem',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: isDragging ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(8px)',
    color: 'var(--color-text)',
    position: 'relative',
    zIndex: isDragging ? 100 : 1,
  };

  const getStatusGlow = () => {
    if (task.status === 'To Do' || task.status === 'col-1') return 'rgba(148, 163, 184, 0.3)';
    if (task.status === 'Doing' || task.status === 'col-2') return 'rgba(59, 130, 246, 0.4)';
    return 'rgba(16, 185, 129, 0.4)';
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="card-hover"
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 15px ${getStatusGlow()}`;
          e.currentTarget.style.borderColor = getStatusGlow();
        }
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        }
      }}
    >
      {task.labels && task.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '0.75rem', gap: '0.25rem' }}>
          {task.labels.map((label, idx) => (
            <span key={idx} className="label-pill" style={{ backgroundColor: label.color, opacity: 0.9 }}>
              {label.name}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ marginBottom: '0.5rem', fontWeight: 600, paddingRight: '2rem', fontSize: '1.05rem', lineHeight: '1.3' }}>{task.title}</h4>
        <div style={{ display: 'flex', gap: '0.25rem', position: 'absolute', top: '1rem', right: '1rem' }}>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onEdit(task); }} 
            style={{ background: 'var(--glass-bg)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--color-text-light)', display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--color-text-light)'; }}
          >
            <Edit2 size={14} />
          </button>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onDelete(task); }} 
            style={{ background: 'var(--glass-danger)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#f87171', display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-danger-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-danger)'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
        {task.description && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Has description">
            <AlignLeft size={14} />
          </div>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: task.subtasks.every(st => st.isCompleted) ? '#10b981' : 'inherit' }}>
            <CheckSquare size={14} />
            <span>{task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}</span>
          </div>
        )}
        {task.comments && task.comments.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MessageSquare size={14} />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {task.status === 'Done' && task.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Clock size={12} />
              <span>Completed</span>
            </div>
          )}

          {task.status !== 'Done' && timeLeft && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? '#f87171' : 'var(--color-primary-light)', background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}` }}>
              <Clock size={12} />
              <span>{timeLeft}</span>
            </div>
          )}
        </div>
        
        {task.assignees && task.assignees.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {task.assignees.slice(0, 3).map((a, i) => (
              <div key={i} className="avatar-small" style={{ marginLeft: i > 0 ? '-10px' : 0, zIndex: 10 - i, width: '28px', height: '28px', fontSize: '0.75rem', border: '2px solid var(--color-surface)' }} title={a.name}>
                {a.name ? a.name.charAt(0).toUpperCase() : '?'}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="avatar-small" style={{ marginLeft: '-10px', zIndex: 1, width: '28px', height: '28px', fontSize: '0.75rem', border: '2px solid var(--color-surface)' }}>
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
