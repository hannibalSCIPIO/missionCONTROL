'use client';

import { useState, useEffect } from 'react';
import { getScheduledTasks, saveScheduledTasks } from '../../lib/storage';
import { ScheduledTask, generateId } from '../../lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    setTasks(getScheduledTasks());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= lastDay || days.length % 7 !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => t.date === formatDate(date));
  };

  const handleSave = (task: ScheduledTask) => {
    let updated: ScheduledTask[];
    if (editingTask) {
      updated = tasks.map(t => t.id === task.id ? task : t);
    } else {
      updated = [...tasks, { ...task, id: generateId() }];
    }
    setTasks(updated);
    saveScheduledTasks(updated);
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveScheduledTasks(updated);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOtherMonth = (date: Date) => {
    return date.getMonth() !== month;
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  // Week view data
  const getWeekData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      week.push(d);
    }
    return week;
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Calendar</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
            <button 
              className={`btn ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: 28, fontSize: 12 }}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`btn ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: 28, fontSize: 12 }}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            + Schedule Task
          </button>
        </div>
      </header>
      <div className="page-content">
        {/* Calendar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn btn-ghost" onClick={() => navigateMonth(-1)}>←</button>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button className="btn btn-ghost" onClick={() => navigateMonth(1)}>→</button>
          </div>
          <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>

        {view === 'month' ? (
          /* Month View */
          <div className="calendar-grid">
            {DAYS.map(day => (
              <div key={day} className="calendar-header">{day}</div>
            ))}
            {days.map((date, idx) => {
              const dayTasks = getTasksForDate(date);
              return (
                <div 
                  key={idx} 
                  className={`calendar-day ${isToday(date) ? 'today' : ''} ${isOtherMonth(date) ? 'other-month' : ''}`}
                  onClick={() => {
                    setEditingTask({
                      id: '', title: '', description: '', date: formatDate(date),
                      assignee: 'jeff', status: 'scheduled', tags: []
                    });
                    setShowModal(true);
                  }}
                >
                  <div className="calendar-day-number">{date.getDate()}</div>
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className={`task-pill ${task.assignee === 'jeff' ? 'todo' : 'in-progress'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                        setShowModal(true);
                      }}
                    >
                      {task.time && `[${task.time}] `}{task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', paddingLeft: 6 }}>
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Week View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {getWeekData().map((date, idx) => {
              const dayTasks = getTasksForDate(date);
              return (
                <div 
                  key={idx}
                  className="card"
                  style={{ minHeight: 300 }}
                >
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 8, 
                    borderBottom: '1px solid var(--border)',
                    background: isToday(date) ? 'rgba(139,92,246,0.1)' : 'transparent',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{DAYS[date.getDay()]}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: isToday(date) ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        style={{ 
                          padding: '6px 8px', 
                          background: task.assignee === 'jeff' ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setEditingTask(task);
                          setShowModal(true);
                        }}
                      >
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>{task.title}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                          {task.time} • {task.assignee === 'jeff' ? 'A' : 'H'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cron Jobs Section */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Cron Jobs & Recurring Tasks</div>
              <div className="card-subtitle">Automated scheduled tasks</div>
            </div>
          </div>
          <div className="task-list">
            {tasks.filter(t => t.cronJob || t.recurring).map(task => (
              <div key={task.id} className="task-item">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {task.recurring} • {task.time} • {task.assignee === 'jeff' ? 'A' : 'H'}
                  </div>
                </div>
                <span className="tag accent">CRON</span>
              </div>
            ))}
            {tasks.filter(t => t.cronJob || t.recurring).length === 0 && (
              <div className="empty-state">
                <div className="empty-state-desc">No cron jobs configured</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ScheduleModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onDelete={editingTask?.id ? () => handleDelete(editingTask.id) : undefined}
        />
      )}
    </>
  );
}

function ScheduleModal({ 
  task, 
  onSave, 
  onClose, 
  onDelete 
}: { 
  task: ScheduledTask | null; 
  onSave: (task: ScheduledTask) => void; 
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<ScheduledTask>(
    task || {
      id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      assignee: 'jeff',
      status: 'scheduled',
      tags: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{task?.id ? 'Edit Schedule' : 'Schedule Task'}</div>
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
                <label className="form-label">Date</label>
                <input 
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time"
                  className="input"
                  value={form.time || ''}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input 
                  type="number"
                  className="input"
                  value={form.duration || 60}
                  onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                />
              </div>
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
            </div>
            <div className="form-group">
              <label className="form-label">Recurring</label>
              <select 
                className="form-select"
                value={form.recurring || ''}
                onChange={e => setForm({ ...form, recurring: e.target.value as any || undefined })}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-wrapper">
                <div className={`checkbox ${form.cronJob ? 'checked' : ''}`} onClick={() => setForm({ ...form, cronJob: !form.cronJob })}>
                  {form.cronJob && '✓'}
                </div>
                <span className="checkbox-label">Mark as Cron Job</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            {onDelete && (
              <button type="button" className="btn btn-ghost" style={{ color: 'var(--error)', marginRight: 'auto' }} onClick={onDelete}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}