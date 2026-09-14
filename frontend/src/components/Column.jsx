import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';

const Column = ({ id, title, tasks, onEditTask, onDeleteTask, onRenameColumn, onDeleteColumn }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        flex: 1, 
        minWidth: '320px', 
        padding: '1.25rem', 
        borderRadius: 'var(--radius-lg)',
        border: isOver ? '1px solid var(--color-primary-light)' : '1px solid var(--color-border)',
        background: isOver ? 'var(--glass-hover)' : 'var(--color-surface)',
        transition: 'all 0.3s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.2rem', fontWeight: 700 }}>
          {title} <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-light)', background: 'var(--glass-bg)', padding: '0.2rem 0.6rem', borderRadius: '1rem', marginLeft: '0.5rem' }}>{tasks.length}</span>
        </h3>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: '0.25rem', borderRadius: '4px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--modal-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '0.5rem', zIndex: 10, minWidth: '150px', backdropFilter: 'blur(10px)' }}>
              <button 
                onClick={() => { setShowMenu(false); onRenameColumn(id, title); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: 'var(--color-text)', borderRadius: '4px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Edit2 size={16} /> Rename
              </button>
              <button 
                onClick={() => { setShowMenu(false); onDeleteColumn(id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: '#f87171', borderRadius: '4px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-danger)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div ref={setNodeRef} style={{ minHeight: '500px' }}>
        <SortableContext items={tasks.map(t => t._id || t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task._id || task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
