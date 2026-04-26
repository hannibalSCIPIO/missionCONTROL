// Mission Control - Storage Utility
import { TaskBoardItem, ScheduledTask, Project, Document, MemoryEntry, CustomTool } from './types';

const STORAGE_KEYS = {
  taskBoard: 'mc_taskboard',
  scheduledTasks: 'mc_scheduled_tasks',
  projects: 'mc_projects',
  documents: 'mc_documents',
  memories: 'mc_memories',
  customTools: 'mc_custom_tools',
};

// Task Board
export function getTaskBoard(): TaskBoardItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.taskBoard);
  return data ? JSON.parse(data) : [];
}

export function saveTaskBoard(tasks: TaskBoardItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.taskBoard, JSON.stringify(tasks));
}

// Scheduled Tasks
export function getScheduledTasks(): ScheduledTask[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.scheduledTasks);
  return data ? JSON.parse(data) : [];
}

export function saveScheduledTasks(tasks: ScheduledTask[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.scheduledTasks, JSON.stringify(tasks));
}

// Projects
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.projects);
  return data ? JSON.parse(data) : getDefaultProjects();
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

function getDefaultProjects(): Project[] {
  return [
    {
      id: '1',
      name: 'Protean Earth',
      description: 'Magnetic refrigerator product website with Stripe integration',
      status: 'active',
      priority: 'high',
      createdAt: '2026-01-01',
      updatedAt: '2026-04-25',
      milestones: [
        { id: 'm1', title: 'Launch MVP', completed: true },
        { id: 'm2', title: 'Add payment processing', completed: true },
        { id: 'm3', title: 'Marketing setup', completed: false }
      ],
      notes: 'Building with Dani as partner'
    },
    {
      id: '2',
      name: 'Photo Magnet Business',
      description: 'Custom photo magnets with 30-min local delivery',
      status: 'active',
      priority: 'medium',
      createdAt: '2026-03-01',
      updatedAt: '2026-04-25',
      milestones: [
        { id: 'm1', title: 'Set up production', completed: true },
        { id: 'm2', title: 'Get first customers', completed: true },
        { id: 'm3', title: 'Scale to outdoor shows', completed: false }
      ],
      notes: 'Partner: Dani, Phone: 385-392-3336'
    }
  ];
}

// Documents
export function getDocuments(): Document[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.documents);
  return data ? JSON.parse(data) : getDefaultDocuments();
}

export function saveDocuments(docs: Document[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(docs));
}

function getDefaultDocuments(): Document[] {
  return [
    {
      id: '1',
      title: 'USER.md',
      category: 'context',
      content: 'User profile and preferences',
      createdAt: '2026-03-21',
      updatedAt: '2026-04-19',
      type: 'markdown',
      tags: ['context', 'preferences']
    },
    {
      id: '2',
      title: 'MEMORY.md',
      category: 'memory',
      content: 'Long-term memory file',
      createdAt: '2026-03-21',
      updatedAt: '2026-04-25',
      type: 'markdown',
      tags: ['memory', ' continuity']
    }
  ];
}

// Memories
export function getMemories(): MemoryEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.memories);
  return data ? JSON.parse(data) : getDefaultMemories();
}

export function saveMemories(memories: MemoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.memories, JSON.stringify(memories));
}

function getDefaultMemories(): MemoryEntry[] {
  return [
    {
      id: '1',
      date: '2026-04-25',
      summary: 'Set up Mission Control dashboard',
      category: 'conversation',
      importance: 'high',
      content: 'Created comprehensive Mission Control with task board, calendar, and custom tools'
    },
    {
      id: '2',
      date: '2026-04-24',
      summary: 'Daily brief on ETFs and moat companies',
      category: 'conversation',
      importance: 'medium',
      content: 'Generated AI brief about ETFs and moat companies for business intelligence'
    },
    {
      id: '3',
      date: '2026-04-19',
      summary: 'Photo magnet business setup',
      category: 'decision',
      importance: 'high',
      content: 'Decided to pursue photo magnet business with Dani, set up 30-min delivery'
    }
  ];
}

// Custom Tools
export function getCustomTools(): CustomTool[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.customTools);
  return data ? JSON.parse(data) : getDefaultTools();
}

export function saveCustomTools(tools: CustomTool[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.customTools, JSON.stringify(tools));
}

function getDefaultTools(): CustomTool[] {
  return [
    {
      id: '1',
      name: 'YouTube Summarizer',
      description: 'Extract closed captions from YouTube videos and summarize into teaching material',
      code: `// YouTube Summarizer Tool
// Input: YouTube URL
// Output: Summarized content
function summarize(url) {
  return 'Summarize captions from: ' + url;
}`,
      createdAt: '2026-04-25'
    },
    {
      id: '2',
      name: 'Daily Brief Generator',
      description: 'Generate daily AI brief about ETFs and moat companies',
      code: `// Daily Brief Generator
function generateBrief() {
  return 'Fetching latest market data...';
}`,
      createdAt: '2026-04-25'
    }
  ];
}

// Initialize default data
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.taskBoard)) {
    saveTaskBoard([
      {
        id: '1',
        title: 'Set up Mission Control',
        description: 'Build comprehensive dashboard',
        assignee: 'jefe',
        status: 'done',
        priority: 'high',
        createdAt: '2026-04-25',
        updatedAt: '2026-04-25',
        tags: ['mission-control']
      },
      {
        id: '2',
        title: 'Build YouTube summarizer',
        description: 'Extract and summarize captions',
        assignee: 'jefe',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2026-04-25',
        updatedAt: '2026-04-25',
        tags: ['feature']
      },
      {
        id: '3',
        title: 'Review daily brief',
        description: 'Check ETF and moat company updates',
        assignee: 'jeff',
        status: 'backlog',
        priority: 'medium',
        createdAt: '2026-04-25',
        updatedAt: '2026-04-25',
        tags: ['brief']
      }
    ]);
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.scheduledTasks)) {
    saveScheduledTasks([
      {
        id: '1',
        title: 'Daily Brief',
        description: 'Generate AI brief on ETFs and moat companies',
        date: '2026-04-26',
        time: '08:00',
        duration: 30,
        assignee: 'jefe',
        status: 'scheduled',
        recurring: 'daily',
        cronJob: true,
        tags: []
      },
      {
        id: '2',
        title: 'Photo Magnet Leads',
        description: 'Process new leads',
        date: '2026-04-26',
        time: '10:00',
        duration: 60,
        assignee: 'jefe',
        status: 'scheduled',
        recurring: 'daily',
        cronJob: true,
        tags: []
      }
    ]);
  }
}