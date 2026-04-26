'use client';

import { useState, useEffect } from 'react';
import { getDocuments, saveDocuments } from '../../lib/storage';
import { Document, generateId } from '../../lib/types';

const CATEGORIES = ['context', 'memory', 'business', 'note', 'transcript', 'other'];
const TYPE_LABELS: Record<string, string> = {
  markdown: 'MD',
  transcript: 'TRANS',
  note: 'NOTE',
  other: 'FILE'
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const handleSave = (doc: Document) => {
    let updated: Document[];
    if (editingDoc) {
      updated = documents.map(d => d.id === doc.id ? doc : d);
    } else {
      updated = [...documents, { ...doc, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    }
    setDocuments(updated);
    saveDocuments(updated);
    setShowModal(false);
    setEditingDoc(null);
  };

  const handleDelete = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
  };

  const filteredDocs = documents.filter(d => {
    if (filterCategory !== 'all' && d.category !== filterCategory) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !d.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'context': return 'var(--accent)';
      case 'memory': return '#22C55E';
      case 'business': return 'var(--warning)';
      case 'note': return '#F472B6';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Documents</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input 
            className="input" 
            style={{ width: 200 }}
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select 
            className="form-select" 
            style={{ width: 140 }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingDoc(null); setShowModal(true); }}>
            + New Document
          </button>
        </div>
      </header>
      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Documents</div>
            <div className="stat-value">{documents.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Markdown</div>
            <div className="stat-value accent">{documents.filter(d => d.type === 'markdown').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transcripts</div>
            <div className="stat-value success">{documents.filter(d => d.type === 'transcript').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Notes</div>
            <div className="stat-value">{documents.filter(d => d.type === 'note').length}</div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Updated</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr 
                  key={doc.id} 
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <span style={{ fontWeight: 500 }}>{doc.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="tag" style={{ 
                      background: `${getCategoryColor(doc.category)}15`,
                      color: getCategoryColor(doc.category)
                    }}>
                      {doc.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)'
                    }}>
                      {TYPE_LABELS[doc.type] || doc.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '4px 8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDoc(doc);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">☰</div>
              <div className="empty-state-title">No documents found</div>
              <div className="empty-state-desc">Create your first document or adjust your search</div>
            </div>
          )}
        </div>

        {documents.length === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <div className="empty-state-icon">☰</div>
            <div className="empty-state-title">No documents yet</div>
            <div className="empty-state-desc">Start saving markdown files, transcripts, and notes</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingDoc(null); setShowModal(true); }}>
              + Create First Document
            </button>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selectedDoc.title}</div>
              <button className="modal-close" onClick={() => setSelectedDoc(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflow: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className="tag" style={{ 
                  background: `${getCategoryColor(selectedDoc.category)}15`,
                  color: getCategoryColor(selectedDoc.category)
                }}>{selectedDoc.category}</span>
                <span className="tag">{selectedDoc.type}</span>
              </div>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'monospace', 
                fontSize: 13, 
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                padding: 16,
                borderRadius: 'var(--radius-sm)'
              }}>
                {selectedDoc.content}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDoc(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                setEditingDoc(selectedDoc);
                setSelectedDoc(null);
                setShowModal(true);
              }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <DocumentModal
          document={editingDoc}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingDoc(null); }}
          onDelete={editingDoc?.id ? () => handleDelete(editingDoc.id) : undefined}
        />
      )}
    </>
  );
}

function DocumentModal({ 
  document, 
  onSave, 
  onClose, 
  onDelete 
}: { 
  document: Document | null; 
  onSave: (doc: Document) => void; 
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Document>(
    document || {
      id: '',
      title: '',
      category: 'note',
      content: '',
      createdAt: '',
      updatedAt: '',
      type: 'note',
      tags: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{document?.id ? 'Edit Document' : 'New Document'}</div>
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
                placeholder="Document title"
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select 
                  className="form-select"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as Document['type'] })}
                >
                  <option value="markdown">Markdown</option>
                  <option value="transcript">Transcript</option>
                  <option value="note">Note</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea 
                className="input textarea" 
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Document content..."
                style={{ minHeight: 200, fontFamily: 'monospace' }}
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
            <button type="submit" className="btn btn-primary">Save Document</button>
          </div>
        </form>
      </div>
    </div>
  );
}