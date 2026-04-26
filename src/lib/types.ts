// Mission Control - Type Definitions

export interface TaskBoardItem {
  id: string;
  title: string;
  description: string;
  assignee: 'jeff' | 'jefe';
  status: 'backlog' | 'in_progress' | 'review' | 'live' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
}

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  duration?: number; // minutes
  assignee: 'jeff' | 'jefe';
  status: 'scheduled' | 'completed' | 'cancelled';
  recurring?: 'daily' | 'weekly' | 'monthly';
  cronJob?: boolean;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  milestones: Milestone[];
  notes: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: 'markdown' | 'transcript' | 'note' | 'other';
  tags: string[];
}

export interface MemoryEntry {
  id: string;
  date: string;
  summary: string;
  category: 'conversation' | 'decision' | 'task' | 'note';
  importance: 'low' | 'medium' | 'high';
  content: string;
}

export interface CustomTool {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  lastRun?: string;
}

// Helper functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 16);
}

export function getAssigneeLabel(assignee: 'jeff' | 'jefe'): string {
  return assignee === 'jeff' ? 'A' : 'H';
}

export function getAssigneeName(assignee: 'jeff' | 'jefe'): string {
  return assignee === 'jeff' ? 'Jeff' : 'Jefe';
}