import React from 'react';
import { ExamSection } from '../types';
import { ListeningIcon, ReadingIcon, SpeakingIcon, WritingIcon, HomeIcon, XIcon, SparklesIcon } from './IconComponents';

interface SidebarProps {
  activeSection: ExamSection;
  onSectionChange: (section: ExamSection) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isOpen, setIsOpen }) => {
  const navItems = [
    { id: ExamSection.WELCOME, icon: HomeIcon, label: 'Home' },
    { id: ExamSection.LISTENING, icon: ListeningIcon, label: 'Listening' },
    { id: ExamSection.READING, icon: ReadingIcon, label: 'Reading' },
    { id: ExamSection.WRITING, icon: WritingIcon, label: 'Writing' },
    { id: ExamSection.SPEAKING, icon: SpeakingIcon, label: 'Speaking' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-xl flex flex-col z-30 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 w-6 h-6 bg-blue-500/20 rounded-full animate-ping" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Coach
            </h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 transform hover:scale-105 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 dark:hover:from-slate-700 dark:hover:to-slate-600 dark:hover:text-white'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-lg mr-4 transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-slate-600'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-sm">{item.label}</span>
                  {isActive && (
                    <div className="text-xs opacity-75 mt-0.5">
                      Active Section
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="text-center space-y-2">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} IELTS AI Coach
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Powered by AI
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;