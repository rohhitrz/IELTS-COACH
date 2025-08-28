
import React from 'react';
import { ExamSection } from '../types';
import { ListeningIcon, ReadingIcon, SpeakingIcon, WritingIcon, HomeIcon, XIcon } from './IconComponents';

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

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-md ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">AI Coach</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 -mr-2">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 mr-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>&copy; {new Date().getFullYear()} IELTS AI Coach</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
