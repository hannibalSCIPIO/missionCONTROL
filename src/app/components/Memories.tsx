'use client';

import { useState, useEffect } from 'react';
import { getMemories, saveMemories } from '../../lib/storage';
import { MemoryEntry, generateId } from '../../lib/types';

export default function Memories() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMemories(getMemories());
  }, []);

  const handleSave = (memory: MemoryEntry) => {
    let updated: MemoryEntry[];
    if (editingMemory) {
      updated = memories.map(m => m.id === memory.id ? memory : m);
    } else {
      updated = [...memories, { ...memory, id: generateId() }];
    }
    setMemories(updated);
    saveMemories(updated);
    setShowModal(false);
    setEditingMemory(null);
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    saveMemories(updated);
  };

  // Group by date
  const groupedMemories = memories.reduce((groups, memory) => {
    const date = memory.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(memory);
    return groups;
  }, {} as Record<string, MemoryEntry[]>);

  const filteredMemories = memories.filter(m => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (searchQuery && !m.summary.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conversation': return '💬';
      case 'decision': return '✓';
      case 'task': return '▢';
      case 'note': return '📝';
      default: return '◷';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Memories</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input 
            className="input" 
            style={{ width: 200 }}
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select 
            className="form-select" 
            style={{ width: 140 }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="conversation">Conversations</option>
            <option value="decision">Decisions</option>
            <option value="task">Tasks</option>
            <option value="note">Notes</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingMemory(null); setShowModal(true); }}>
            + Add Memory
          </button>
        </div>
      </header>
      <div className="page-content">
        {/* Memory Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Memories</div>
            <div className="stat-value">{memories.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Conversations</div>
            <div className="stat-value accent">{memories.filter(m => m.category === 'conversation').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Decisions</div>
            <div className="stat-value success">{memories.filter(m => m.category === 'decision').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Priority</div>
            <div className="stat-value error">{memories.filter(m => m.importance === 'high').length}</div>
          </div>
        </div>

        {/* Search Results or Grouped View */}
        {searchQuery || filterCategory !== 'all' ? (
          /* Filtered View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMemories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◷</div>
                <div className="empty-state-title">No memories found</div>
                <div className="empty-state-desc">Try adjusting your search or filters</div>
              </div>
            ) : (
              filteredMemories.map(memory => (
                <div key={memory.id} className="card" onClick={() => { setEditingMemory(memory); setShowModal(true); }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>{getCategoryIcon(memory.category)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{memory.summary}</span>
                        <span style={{ 
                          fontSize: 10, 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          background: getImportanceColor(memory.importance) 
                        }} />
                        <span className="tag">{memory.category}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {memory.content.substring(0, 150)}{memory.content.length > 150 ? '...' : ''}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {memory.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Grouped by Date View */
          Object.keys(groupedMemories).sort((a, b) => b.localeCompare(a)).map(date => (
            <div key={date} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupedMemories[date].map(memory => (
                  <div key={memory.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setEditingMemory(memory); setShowModal(true); }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 24 }}>{getCategoryIcon(memory.category)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{memory.summary}</span>
                          <span style={{ 
                            fontSize: 10, 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: getImportanceColor(memory.importance) 
                          }} />
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                          {memory.content.substring(0, 200)}{memory.content.length > 200 ? '...' : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span className="tag">{memory.category}</span>
                          <span className={`tag ${memory.importance === 'high' ? 'accent' : ''}`} style={{ 
                            background: memory.importance === 'high' ? 'rgba(239,68,68,0.15)' : 'var(--bg-tertiary)',
                            color: memory.importance === 'high' ? 'var(--error)' : 'var(--text-secondary)'
                          }}>{memory.importance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {memories.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">◷</div>
            <div className="empty-state-title">No memories yet</div>
            <div className="empty-state-desc">Add your first memory to start building your long-term memory</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingMemory(null); setShowModal(true); }}>
              + Add First Memory
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <MemoryModal
          memory={editingMemory}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingMemory(null); }}
          onDelete={editingMemory?.id ? () => handleDelete(editingMemory.id) : undefined}
        />
      )}
    </>
  );
}

function MemoryModal({ 
  memory, 
  onSave, 
  onClose, 
  onDelete 
}: { 
  memory: MemoryEntry | null; 
  onSave: (memory: MemoryEntry) => void; 
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<MemoryEntry>(
    memory || {
      id: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      category: 'conversation',
      importance: 'medium',
      content: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{memory?.id ? 'Edit Memory' : 'Add Memory'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
              <label className="form-label">Summary</label>
              <input 
                className="input" 
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                placeholder="Brief summary of the memory"
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as MemoryEntry['category'] })}
                >
                  <option value="conversation">Conversation</option>
                  <option value="decision">Decision</option>
                  <option value="task">Task</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Importance</label>
                <select 
                  className="form-select"
                  value={form.importance}
                  onChange={e => setForm({ ...form, importance: e.target.value as MemoryEntry['importance'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea 
                className="input textarea" 
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Full memory details..."
                style={{ minHeight: 150 }}
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
            <button type="submit" className="btn btn-primary">Save Memory</button>
          </div>
        </form>
      </div>
    </div>
  );
}