'use client';

import { useState, useEffect } from 'react';
import { getTaskBoard, getScheduledTasks, getProjects, getMemories } from '../../lib/storage';
import { TaskBoardItem, ScheduledTask, Project, MemoryEntry } from '../../lib/types';

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskBoardItem[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    setTasks(getTaskBoard());
    setScheduledTasks(getScheduledTasks());
    setProjects(getProjects());
    setMemories(getMemories());
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const todayScheduled = scheduledTasks.filter(t => t.date === new Date().toISOString().split('T')[0]);

  const getProjectSuggestions = () => {
    const suggestions: string[] = [];
    projects.forEach(project => {
      if (project.status === 'active') {
        if (project.milestones && project.milestones.filter(m => !m.completed).length > 2) {
          suggestions.push(`${project.name}: Focus on completing next milestone`);
        }
        if (project.priority === 'high') {
          suggestions.push(`${project.name}: High priority - consider dedicating more time`);
        }
      }
    });
    if (suggestions.length === 0) {
      suggestions.push('All projects are on track! Great work.');
    }
    return suggestions;
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="tag accent">Live</span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </header>
      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-value accent">{pendingTasks}</div>
            <div className="stat-desc">{completedTasks} completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today's Schedule</div>
            <div className="stat-value warning">{todayScheduled.length}</div>
            <div className="stat-desc">scheduled items</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Projects</div>
            <div className="stat-value success">{activeProjects}</div>
            <div className="stat-desc">{projects.length} total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Memories</div>
            <div className="stat-value">{memories.length}</div>
            <div className="stat-desc">entries recorded</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-col">
          {/* Today's Schedule */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Today's Schedule</div>
                <div className="card-subtitle">Cron jobs and scheduled tasks</div>
              </div>
              <button className="btn btn-ghost">View Calendar →</button>
            </div>
            {todayScheduled.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">☷</div>
                <div className="empty-state-title">No tasks scheduled</div>
                <div className="empty-state-desc">Schedule tasks in the Calendar view</div>
              </div>
            ) : (
              <div className="task-list">
                {todayScheduled.map(task => (
                  <div key={task.id} className="task-item">
                    <div style={{ 
                      width: 8, height: 8, borderRadius: '50%', 
                      background: task.status === 'completed' ? 'var(--success)' : 'var(--warning)' 
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {task.time} • {task.duration}min • {task.assignee === 'jeff' ? 'A' : 'H'}
                      </div>
                    </div>
                    {task.cronJob && <span className="tag">CRON</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Quick Actions</div>
                <div className="card-subtitle">Common tasks</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                + New Task
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                + New Project
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                + Schedule
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                + Note
              </button>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">💡 AI Suggestions</div>
              <div className="card-subtitle">Your daily improvement recommendations</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {getProjectSuggestions().map((suggestion, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <span style={{ color: 'var(--text-primary)' }}>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent Tasks</div>
              <div className="card-subtitle">Latest activity from Jeff and Jefe</div>
            </div>
            <button className="btn btn-ghost">View All →</button>
          </div>
          <div className="task-list">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="task-item">
                <div className="checkbox" style={{ 
                  background: task.status === 'done' ? 'var(--success)' : 'var(--bg-primary)',
                  borderColor: task.status === 'done' ? 'var(--success)' : 'var(--border)'
                }}>
                  {task.status === 'done' && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={task.status === 'done' ? 'checkbox-label completed' : 'checkbox-label'}>
                    {task.title}
                  </div>
                </div>
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
                <span className={`tag`} style={{ 
                  background: task.status === 'done' ? 'rgba(34,197,94,0.15)' : 
                             task.status === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'var(--bg-tertiary)',
                  color: task.status === 'done' ? 'var(--success)' : 
                         task.status === 'in_progress' ? 'var(--warning)' : 'var(--text-secondary)'
                }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}