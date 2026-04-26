'use client';

import { useState, useEffect } from 'react';
import { getProjects, saveProjects } from '../../lib/storage';
import { Project, Milestone, generateId } from '../../lib/types';

const STATUS_COLORS: Record<string, string> = {
  planning: 'var(--accent)',
  active: 'var(--success)',
  paused: 'var(--warning)',
  completed: 'var(--text-tertiary)',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleSave = (project: Project) => {
    let updated: Project[];
    if (editingProject) {
      updated = projects.map(p => p.id === project.id ? project : p);
    } else {
      updated = [...projects, { ...project, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    }
    setProjects(updated);
    saveProjects(updated);
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ),
        updatedAt: new Date().toISOString()
      };
    });
    setProjects(updated);
    saveProjects(updated);
  };

  const filteredProjects = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);

  const getAISuggestions = () => {
    const suggestions: { project: Project; suggestion: string }[] = [];
    
    projects.forEach(project => {
      if (project.status === 'active') {
        const incompleteMilestones = project.milestones.filter(m => !m.completed);
        if (incompleteMilestones.length > 2) {
          suggestions.push({
            project,
            suggestion: `${project.name} has ${incompleteMilestones.length} incomplete milestones. Consider breaking these down into smaller tasks.`
          });
        }
        if (project.priority === 'high' && incompleteMilestones.length > 0) {
          suggestions.push({
            project,
            suggestion: `${project.name} is a high-priority project with incomplete work. Prioritize this today.`
          });
        }
      }
      if (project.status === 'paused') {
        suggestions.push({
          project,
          suggestion: `${project.name} is paused. Either resume or mark as completed to clean up your view.`
        });
      }
      if (project.status === 'planning') {
        suggestions.push({
          project,
          suggestion: `${project.name} is still in planning. Define clear milestones to move forward.`
        });
      }
    });

    if (suggestions.length === 0) {
      return [{ project: null, suggestion: "All projects are on track! Great work managing your portfolio." }];
    }

    return suggestions;
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Projects</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: 140 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingProject(null); setShowModal(true); }}>
            + New Project
          </button>
        </div>
      </header>
      <div className="page-content">
        {/* AI Suggestions */}
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">💡 AI Project Suggestions</div>
              <div className="card-subtitle">Daily improvement recommendations</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {getAISuggestions().map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <span style={{ fontSize: 18, marginTop: 2 }}>💡</span>
                <div>
                  <span style={{ color: 'var(--text-primary)' }}>{item.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filteredProjects.map(project => (
            <div key={project.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setEditingProject(project); setShowModal(true); }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{project.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{project.description}</div>
                </div>
                <span 
                  className="tag"
                  style={{ 
                    background: `${STATUS_COLORS[project.status]}20`,
                    color: STATUS_COLORS[project.status]
                  }}
                >
                  {project.status}
                </span>
              </div>
              
              {/* Progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Progress</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(project.milestones.filter(m => m.completed).length / Math.max(project.milestones.length, 1)) * 100}%`,
                    background: STATUS_COLORS[project.status],
                    transition: 'width 300ms ease'
                  }} />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 8 }}>Milestones</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {project.milestones.map(milestone => (
                    <div 
                      key={milestone.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '6px 10px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMilestone(project.id, milestone.id);
                      }}
                    >
                      <div 
                        className="checkbox"
                        style={{ 
                          background: milestone.completed ? 'var(--success)' : 'var(--bg-primary)',
                          borderColor: milestone.completed ? 'var(--success)' : 'var(--border)',
                          cursor: 'pointer'
                        }}
                      >
                        {milestone.completed && '✓'}
                      </div>
                      <span style={{ 
                        flex: 1, 
                        textDecoration: milestone.completed ? 'line-through' : 'none',
                        color: milestone.completed ? 'var(--text-tertiary)' : 'var(--text-primary)'
                      }}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span className={`tag ${project.priority === 'high' ? 'accent' : ''}`}>
                  {project.priority} priority
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">◈</div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-desc">Start tracking your projects to avoid the scatterbrain</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingProject(null); setShowModal(true); }}>
              + Create First Project
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null); }}
          onDelete={editingProject?.id ? () => handleDelete(editingProject.id) : undefined}
        />
      )}
    </>
  );
}

function ProjectModal({ 
  project, 
  onSave, 
  onClose, 
  onDelete 
}: { 
  project: Project | null; 
  onSave: (project: Project) => void; 
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Project>(
    project || {
      id: '',
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      createdAt: '',
      updatedAt: '',
      milestones: [],
      notes: ''
    }
  );

  const [newMilestone, setNewMilestone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setForm({
      ...form,
      milestones: [...form.milestones, { id: generateId(), title: newMilestone, completed: false }]
    });
    setNewMilestone('');
  };

  const removeMilestone = (id: string) => {
    setForm({
      ...form,
      milestones: form.milestones.filter(m => m.id !== id)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{project?.id ? 'Edit Project' : 'New Project'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input 
                className="input" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Project name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="input textarea" 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What is this project about?"
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Project['status'] })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as Project['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
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

            {/* Milestones */}
            <div className="form-group">
              <label className="form-label">Milestones</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input 
                  className="input"
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  placeholder="Add milestone"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <button type="button" className="btn btn-secondary" onClick={addMilestone}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {form.milestones.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{m.title}</span>
                    <button type="button" className="btn btn-ghost" style={{ color: 'var(--error)', padding: '4px 8px' }} onClick={() => removeMilestone(m.id)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea 
                className="input textarea" 
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
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
            <button type="submit" className="btn btn-primary">Save Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}