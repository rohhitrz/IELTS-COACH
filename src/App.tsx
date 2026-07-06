import React, { useState, useEffect } from 'react';
import { ExamSection } from './types';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import MockTests from './components/MockTests';
import ReadingSection from './components/ReadingSection';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ListeningSection from './components/ListeningSection';
import ErrorBoundary from './components/ErrorBoundary';
import { MoonIcon, SunIcon, MenuIcon } from './components/IconComponents';
import './styles/animations.css';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ExamSection>(ExamSection.WELCOME);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSectionChange = (section: ExamSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false); // Close sidebar on section change on mobile
  };
  
  const renderSection = () => {
    switch (activeSection) {
      case ExamSection.WELCOME:
        return <WelcomeScreen onNavigate={handleSectionChange} />;
      case ExamSection.DASHBOARD:
        return <Dashboard onNavigate={handleSectionChange} />;
      case ExamSection.MOCK_TESTS:
        return <MockTests />;
      case ExamSection.LISTENING:
        return <ListeningSection />;
      case ExamSection.READING:
        return <ReadingSection />;
      case ExamSection.WRITING:
        return <WritingSection />;
      case ExamSection.SPEAKING:
        return <SpeakingSection />;
      default:
        return <WelcomeScreen onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className="flex h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between gap-3 px-4 md:px-8 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300" aria-label="Open menu">
              <MenuIcon className="w-6 h-6"/>
           </button>
           <div className="flex-1 md:text-left">
              <h1 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">IELTS Academic AI Coach</h1>
           </div>
           <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <ErrorBoundary resetKey={activeSection}>
                {renderSection()}
              </ErrorBoundary>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;