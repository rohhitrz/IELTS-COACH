import React, { useState, useEffect } from 'react';
import { ExamSection } from './types';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ReadingSection from './components/ReadingSection';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ListeningSection from './components/ListeningSection';
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
        return <WelcomeScreen />;
      case ExamSection.LISTENING:
        return <ListeningSection />;
      case ExamSection.READING:
        return <ReadingSection />;
      case ExamSection.WRITING:
        return <WritingSection />;
      case ExamSection.SPEAKING:
        return <SpeakingSection />;
      default:
        return <WelcomeScreen />;
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
        <header className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2">
              <MenuIcon className="w-6 h-6"/>
           </button>
           <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">IELTS Academic AI Coach</h1>
           </div>
           <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              {renderSection()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;