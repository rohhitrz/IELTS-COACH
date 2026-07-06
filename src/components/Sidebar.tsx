import React from 'react';
import { ExamSection } from '../types';
import { ListeningIcon, ReadingIcon, SpeakingIcon, WritingIcon, HomeIcon, XIcon, SparklesIcon, ChartBarIcon, BookOpenIcon } from './IconComponents';

interface SidebarProps {
  activeSection: ExamSection;
  onSectionChange: (section: ExamSection) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  id: ExamSection;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const NAV_GROUPS: { heading: string | null; items: NavItem[] }[] = [
  {
    heading: null,
    items: [
      { id: ExamSection.WELCOME, icon: HomeIcon, label: 'Home' },
      { id: ExamSection.DASHBOARD, icon: ChartBarIcon, label: 'Dashboard' },
      { id: ExamSection.MOCK_TESTS, icon: BookOpenIcon, label: 'Mock Tests' },
    ],
  },
  {
    heading: 'Practice by skill',
    items: [
      { id: ExamSection.LISTENING, icon: ListeningIcon, label: 'Listening' },
      { id: ExamSection.READING, icon: ReadingIcon, label: 'Reading' },
      { id: ExamSection.WRITING, icon: WritingIcon, label: 'Writing' },
      { id: ExamSection.SPEAKING, icon: SpeakingIcon, label: 'Speaking' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">IELTS Coach</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Academic preparation</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.heading && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.heading}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} IELTS Coach
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
