'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import Projects from './components/Projects';
import Memories from './components/Memories';
import Documents from './components/Documents';
import CustomToolsPage from './components/CustomToolsPage';
import YouTubeSummarizer from './components/YouTubeSummarizer';
import { initializeStorage } from '../lib/storage';

type Page = 'dashboard' | 'tasks' | 'calendar' | 'projects' | 'memories' | 'documents' | 'tools' | 'youtube';

export default function MissionControl() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeStorage();
    setInitialized(true);
  }, []);

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskBoard />;
      case 'calendar':
        return <Calendar />;
      case 'projects':
        return <Projects />;
      case 'memories':
        return <Memories />;
      case 'documents':
        return <Documents />;
      case 'tools':
        return <CustomToolsPage />;
      case 'youtube':
        return <YouTubeSummarizer />;
      default:
        return <Dashboard />;
    }
  }, [currentPage]);

  if (!initialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0F0F0F',
        color: '#8B5CF6'
      }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}