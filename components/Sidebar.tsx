
import React from 'react';
import { ExamSection } from '../types';
import { ListeningIcon, ReadingIcon, SpeakingIcon, WritingIcon, HomeIcon } from './IconComponents';

interface SidebarProps {
  activeSection: ExamSection;
  onSectionChange: (section: ExamSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: ExamSection.WELCOME, icon: HomeIcon, label: 'Home' },
    { id: ExamSection.LISTENING, icon: ListeningIcon, label: 'Listening' },
    { id: ExamSection.READING, icon: ReadingIcon, label: 'Reading' },
    { id: ExamSection.WRITING, icon: WritingIcon, label: 'Writing' },
    { id: ExamSection.SPEAKING, icon: SpeakingIcon, label: 'Speaking' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-blue-600">AI Coach</h2>
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
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-6 h-6 mr-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} IELTS AI Coach</p>
      </div>
    </aside>
  );
};

export default Sidebar;
