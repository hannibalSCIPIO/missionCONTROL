'use client';

import { useState, useEffect } from 'react';
import { getTaskBoard, saveTaskBoard } from '../../lib/storage';
import { TaskBoardItem, generateId } from '../../lib/types';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-tertiary)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--warning)' },
  { id: 'review', label: 'Review', color: 'var(--accent)' },
  { id: 'live', label: 'Live', color: '#F472B6' },
  { id: 'done', label: 'Done', color: 'var(--success)' },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<TaskBoardItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskBoardItem | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<'all' | 'jeff' | 'jefe'>('all');

  useEffect(() => {
    setTasks(getTaskBoard());
  }, []);

  const handleSave = (task: TaskBoardItem) => {
    let updated: TaskBoardItem[];
    if (editingTask) {
      updated = tasks.map(t => t.id === task.id ? task : t);
    } else {
      updated = [...tasks, { ...task, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    }
    setTasks(updated);
    saveTaskBoard(updated);
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTaskBoard(updated);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskBoardItem['status']) => {
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
    saveTaskBoard(updated);
  };

  const filteredTasks = filterAssignee === 'all' ? tasks : tasks.filter(t => t.assignee === filterAssignee);

  const getTasksByColumn = (status: string) => {
    return filteredTasks.filter(t => t.status === status);
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Task Board</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: 140 }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="jeff">A - Jeff</option>
            <option value="jefe">H - Jefe</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            + Add Task
          </button>
        </div>
      </header>
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, minHeight: 500 }}>
          {COLUMNS.map(column => (
            <div key={column.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: '1px solid var(--border)',
                borderBottom: `3px solid ${column.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{column.label}</span>
                  <span style={{ 
                    fontSize: 12, 
                    background: 'var(--bg-tertiary)', 
                    padding: '2px 8px', 
                    borderRadius: 10,
                    color: 'var(--text-secondary)'
                  }}>
                    {getTasksByColumn(column.id).length}
                  </span>
                </div>
              </div>
              <div style={{ 
                flex: 1, 
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border)',
                borderTop: 'none',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 300
              }}>
                {getTasksByColumn(column.id).map(task => (
                  <div 
                    key={task.id}
                    className="card"
                    style={{ padding: 12, cursor: 'grab' }}
                    onClick={() => { setEditingTask(task); setShowModal(true); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 600,
                        color: task.assignee === 'jeff' ? '#22C55E' : '#8B5CF6',
                        background: task.assignee === 'jeff' ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        {task.assignee === 'jeff' ? 'A' : 'H'}
                      </span>
                      <span className={`task-pill ${task.priority === 'high' ? 'in-progress' : task.priority === 'medium' ? 'todo' : 'done'}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                        {task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}
                      </div>
                    )}
                    {task.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {task.tags.map(tag => (
                          <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                      {column.id !== 'backlog' && (
                        <button 
                          className="btn btn-ghost"
                          style={{ fontSize: 11, padding: '4px 8px', height: 24 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = COLUMNS.findIndex(c => c.id === column.id);
                            if (idx > 0) handleStatusChange(task.id, COLUMNS[idx - 1].id as TaskBoardItem['status']);
                          }}
                        >
                          ←
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button 
                          className="btn btn-ghost"
                          style={{ fontSize: 11, padding: '4px 8px', height: 24 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = COLUMNS.findIndex(c => c.id === column.id);
                            if (idx < COLUMNS.length - 1) handleStatusChange(task.id, COLUMNS[idx + 1].id as TaskBoardItem['status']);
                          }}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-ghost"
                  style={{ 
                    border: '1px dashed var(--border)', 
                    width: '100%',
                    justifyContent: 'center',
                    opacity: 0.5
                  }}
                  onClick={() => { setEditingTask(null); setShowModal(true); }}
                >
                  + Add to {column.label}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#22C55E' }}>A</span>
            Jeff
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#8B5CF6' }}>H</span>
            Jefe
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            ← → Drag tasks between columns
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onDelete={editingTask ? () => handleDelete(editingTask.id) : undefined}
        />
      )}
    </>
  );
}

function TaskModal({ 
  task, 
  onSave, 
  onClose, 
  onDelete 
}: { 
  task: TaskBoardItem | null; 
  onSave: (task: TaskBoardItem) => void; 
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<TaskBoardItem>(
    task || {
      id: '',
      title: '',
      description: '',
      assignee: 'jeff',
      status: 'backlog',
      priority: 'medium',
      createdAt: '',
      updatedAt: '',
      tags: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{task ? 'Edit Task' : 'New Task'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                className="input" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="input textarea" 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Task description"
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="form-select"
                  value={form.assignee}
                  onChange={e => setForm({ ...form, assignee: e.target.value as 'jeff' | 'jefe' })}
                >
                  <option value="jeff">A - Jeff</option>
                  <option value="jefe">H - Jefe</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as TaskBoardItem['status'] })}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="live">Live</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as TaskBoardItem['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date"
                  className="input"
                  value={form.dueDate || ''}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input 
                className="input"
                value={form.tags.join(', ')}
                onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <div className="modal-footer">
            {onDelete && (
              <button type="button" className="btn btn-ghost" style={{ color: 'var(--error)', marginRight: 'auto' }} onClick={onDelete}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}