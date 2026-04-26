'use client';

import { TaskBoardItem, ScheduledTask, Project, Document, MemoryEntry, CustomTool } from '../../lib/types';

type Page = 'dashboard' | 'tasks' | 'calendar' | 'projects' | 'memories' | 'documents' | 'tools' | 'youtube';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'tasks', label: 'Task Board', icon: '▦' },
  { id: 'calendar', label: 'Calendar', icon: '☷' },
  { id: 'projects', label: 'Projects', icon: '◈' },
  { id: 'memories', label: 'Memories', icon: '◷' },
  { id: 'documents', label: 'Documents', icon: '☰' },
  { id: 'youtube', label: 'YouTube', icon: '▶' },
  { id: 'tools', label: 'Custom Tools', icon: '⚙' },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span>Mission Control</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
          Jeff's Command Center
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          v2.0 • Active
        </div>
      </div>
    </aside>
  );
}