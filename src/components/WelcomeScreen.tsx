import React from 'react';
import { ExamSection } from '../types';
import { SparklesIcon, TrophyIcon, TargetIcon, BookOpenIcon, ClockIcon, ChartBarIcon } from './IconComponents';
import AnimatedCard from './AnimatedCard';

interface WelcomeScreenProps {
  onNavigate: (section: ExamSection) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'Full mock tests',
      description: 'Complete four-section practice tests that mirror the real IELTS Academic exam, with band scores for each part.',
    },
    {
      icon: TrophyIcon,
      title: 'Examiner-style feedback',
      description: 'Detailed evaluation against the official band descriptors, with sentence-level corrections and model answers.',
    },
    {
      icon: TargetIcon,
      title: 'Targeted practice',
      description: 'Drill any single skill on demand and get instant, explained results for every question.',
    },
    {
      icon: ChartBarIcon,
      title: 'Progress tracking',
      description: 'A personal dashboard with band trends, streaks, and the weak areas to focus on next.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <AnimatedCard hover={false} className="relative overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-blue-600 to-indigo-700 border-0 text-white">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-20 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-5">
            <SparklesIcon className="w-4 h-4" />
            AI-powered IELTS Academic coaching
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Prepare for IELTS with realistic tests and honest feedback
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Practise all four skills under exam conditions, then get band scores and specific, actionable
            feedback on exactly how to improve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate(ExamSection.MOCK_TESTS)}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              Take a mock test
            </button>
            <button
              onClick={() => onNavigate(ExamSection.DASHBOARD)}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500/30 text-white font-semibold rounded-lg border border-white/25 hover:bg-blue-500/50 transition-colors"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              View dashboard
            </button>
          </div>
        </div>
      </AnimatedCard>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Everything you need to prepare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} className="p-6" delay={100 + index * 80}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Skills row */}
      <AnimatedCard className="p-6" delay={500}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Practise a single skill</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Jump straight into any section for focused, on-demand practice.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Listening', section: ExamSection.LISTENING },
              { label: 'Reading', section: ExamSection.READING },
              { label: 'Writing', section: ExamSection.WRITING },
              { label: 'Speaking', section: ExamSection.SPEAKING },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => onNavigate(s.section)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </AnimatedCard>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 justify-center">
        <ClockIcon className="w-4 h-4" />
        Tip: mock tests can be taken one section at a time — your progress is saved automatically.
      </div>
    </div>
  );
};

export default WelcomeScreen;
