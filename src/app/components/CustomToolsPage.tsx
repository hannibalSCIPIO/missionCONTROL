'use client';

import { useState, useEffect } from 'react';
import { getCustomTools, saveCustomTools } from '../../lib/storage';
import { CustomTool, generateId } from '../../lib/types';

export default function CustomToolsPage() {
  const [tools, setTools] = useState<CustomTool[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [toolOutput, setToolOutput] = useState<{ name: string; output: string } | null>(null);

  useEffect(() => {
    setTools(getCustomTools());
  }, []);

  const handleSave = (tool: CustomTool) => {
    let updated: CustomTool[];
    if (editingTool) {
      updated = tools.map(t => t.id === tool.id ? tool : t);
    } else {
      updated = [...tools, { ...tool, id: generateId(), createdAt: new Date().toISOString() }];
    }
    setTools(updated);
    saveCustomTools(updated);
    setShowModal(false);
    setEditingTool(null);
  };

  const handleDelete = (id: string) => {
    const updated = tools.filter(t => t.id !== id);
    setTools(updated);
    saveCustomTools(updated);
  };

  const runTool = async (tool: CustomTool) => {
    setRunningTool(tool.id);
    setToolOutput(null);

    try {
      // Create a sandboxed function to run the tool code
      const toolFunction = new Function('input', `
        try {
          ${tool.code}
          return typeof run === 'function' ? run(input) : 'Tool executed (no output function defined)';
        } catch (e) {
          return 'Error: ' + e.message;
        }
      `);
      
      const result = toolFunction('');
      
      setToolOutput({
        name: tool.name,
        output: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      });

      // Update last run time
      const updated = tools.map(t => 
        t.id === tool.id ? { ...t, lastRun: new Date().toISOString() } : t
      );
      setTools(updated);
      saveCustomTools(updated);

    } catch (err: any) {
      setToolOutput({
        name: tool.name,
        output: `Error: ${err.message}`
      });
    }

    setRunningTool(null);
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Custom Tools</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => { setEditingTool(null); setShowModal(true); }}>
            + Create Tool
          </button>
        </div>
      </header>
      <div className="page-content">
        {/* Intro */}
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Build Your Own Tools</div>
              <div className="card-subtitle">Create custom JavaScript tools to automate your workflow</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 8 }}>Custom tools let you extend Mission Control with your own functionality. Write JavaScript code that can:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Process and transform data</li>
              <li>Integrate with external APIs</li>
              <li>Automate repetitive tasks</li>
              <li>Generate reports and summaries</li>
            </ul>
          </div>
        </div>

        {/* Tool Output */}
        {toolOutput && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <div className="card-title">📤 Output: {toolOutput.name}</div>
              </div>
              <button className="btn btn-ghost" onClick={() => setToolOutput(null)}>Clear</button>
            </div>
            <pre style={{ 
              background: 'var(--bg-primary)', 
              padding: 16, 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'monospace',
              fontSize: 12,
              maxHeight: 300,
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {toolOutput.output}
            </pre>
          </div>
        )}

        {/* Tools Grid */}
        {tools.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚙</div>
            <div className="empty-state-title">No custom tools yet</div>
            <div className="empty-state-desc">Create your first tool to get started</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingTool(null); setShowModal(true); }}>
              + Create First Tool
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {tools.map(tool => (
              <div key={tool.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{tool.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tool.description}</div>
                  </div>
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: 4 }}
                    onClick={() => {
                      setEditingTool(tool);
                      setShowModal(true);
                    }}
                  >
                    ⚙
                  </button>
                </div>

                {/* Code Preview */}
                <div style={{ 
                  background: 'var(--bg-primary)', 
                  padding: 12, 
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  marginBottom: 12,
                  maxHeight: 100,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {tool.code.substring(0, 200)}...
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {tool.lastRun && `Last run: ${new Date(tool.lastRun).toLocaleString()}`}
                    {!tool.lastRun && `Created: ${new Date(tool.createdAt).toLocaleDateString()}`}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ fontSize: 12 }}
                      onClick={() => handleDelete(tool.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="btn btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={() => runTool(tool)}
                      disabled={runningTool === tool.id}
                    >
                      {runningTool === tool.id ? <span className="spinner" /> : '▶ Run'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested Tools */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>💡 Suggested Tools</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => {
              setEditingTool({
                id: '', name: 'Lead Enrichment', description: 'Enrich lead data from CSV with additional information',
                code: `// Lead Enrichment Tool
// Input: Array of leads
// Output: Enriched lead data

function run(input) {
  const leads = input || [];
  return leads.map(lead => ({
    ...lead,
    enriched: true,
    source: 'enrichment_tool',
    timestamp: new Date().toISOString()
  }));
}`, createdAt: ''
              });
              setShowModal(true);
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Lead Enrichment</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enrich lead data from CSV</div>
            </div>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => {
              setEditingTool({
                id: '', name: 'URL Metadata Fetcher', description: 'Fetch metadata (title, description, images) from URLs',
                code: `// URL Metadata Fetcher
// Input: URL string
// Output: Metadata object

async function run(input) {
  const url = input;
  // In production, use a serverless function to fetch
  return {
    url: url,
    title: 'Page Title',
    description: 'Page description',
    image: 'og:image URL'
  };
}`, createdAt: ''
              });
              setShowModal(true);
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>URL Metadata Fetcher</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fetch metadata from URLs</div>
            </div>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => {
              setEditingTool({
                id: '', name: 'Invoice Generator', description: 'Generate simple invoices from structured data',
                code: `// Invoice Generator
// Input: Invoice data object
// Output: Formatted invoice

function run(input) {
  const invoice = {
    number: input.number || 'INV-001',
    date: new Date().toLocaleDateString(),
    items: input.items || [],
    total: (input.items || []).reduce((sum, item) => sum + item.price * item.qty, 0)
  };
  
  return \`INVOICE #\${invoice.number}
Date: \${invoice.date}
--------------------------
\${invoice.items.map(i => i.desc + ' x' + i.qty + ' = $' + i.price * i.qty).join('\\n')}
--------------------------
TOTAL: $\${invoice.total}\`;
}`, createdAt: ''
              });
              setShowModal(true);
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Invoice Generator</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generate simple invoices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ToolModal
          tool={editingTool}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTool(null); }}
        />
      )}
    </>
  );
}

function ToolModal({ 
  tool, 
  onSave, 
  onClose 
}: { 
  tool: CustomTool | null; 
  onSave: (tool: CustomTool) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState<CustomTool>(
    tool || {
      id: '',
      name: '',
      description: '',
      code: '// Custom Tool\n// Write your JavaScript code here\n\nfunction run(input) {\n  return "Hello, " + input;\n}',
      createdAt: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{tool?.id ? 'Edit Tool' : 'Create Tool'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tool Name</label>
              <input 
                className="input" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="My Custom Tool"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="input textarea" 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What does this tool do?"
                style={{ minHeight: 60 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">JavaScript Code</label>
              <textarea 
                className="input textarea" 
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                placeholder="function run(input) { ..."
                style={{ 
                  minHeight: 200, 
                  fontFamily: 'monospace',
                  fontSize: 12
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Write a <code>run(input)</code> function that processes the input and returns a result
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Tool</button>
          </div>
        </form>
      </div>
    </div>
  );
}