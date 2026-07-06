import React, { useState, useEffect } from 'react';
import { MockTest, MockTestResults } from '../types';
import { loadMockTests } from '../services/mockTestService';
import { getMockResults, overallBand } from '../services/progressService';
import MockTestRunner from './MockTestRunner';
import AnimatedCard from './AnimatedCard';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, TrophyIcon } from './IconComponents';

const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking'] as const;

const MockTests: React.FC = () => {
  const [tests, setTests] = useState<MockTest[] | null>(null);
  const [selected, setSelected] = useState<MockTest | null>(null);
  const [results, setResults] = useState<Record<string, MockTestResults>>({});

  useEffect(() => {
    loadMockTests().then(setTests);
  }, []);

  // Refresh stored results whenever we return to the library
  useEffect(() => {
    if (!selected) setResults(getMockResults());
  }, [selected]);

  if (selected) {
    return <MockTestRunner test={selected} onExit={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown">Mock Tests</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Full-length IELTS Academic practice tests, each with all four sections. Take them under real conditions and track your band scores.
        </p>
      </div>

      {!tests && <LoadingSpinner text="Loading mock tests..." />}

      {tests && tests.length === 0 && (
        <AnimatedCard className="p-8 text-center text-slate-500 dark:text-slate-400">
          No mock tests are available yet.
        </AnimatedCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tests?.map((test, i) => {
          const r = results[test.id] || {};
          const bands = SECTION_KEYS.map((k) => r[k]?.band).filter((b): b is number => b !== undefined);
          const completed = bands.length;
          return (
            <AnimatedCard key={test.id} className="p-6 flex flex-col" delay={i * 60}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{test.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{test.theme}</p>
                </div>
                {completed === 4 && (
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="flex items-center gap-1 text-yellow-500 justify-end">
                      <TrophyIcon className="w-4 h-4" />
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overallBand(bands)}</span>
                    </div>
                    <p className="text-xs text-slate-400">overall</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 my-4">
                {SECTION_KEYS.map((k) => {
                  const done = r[k];
                  return (
                    <span
                      key={k}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${
                        done
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {done && <CheckCircleIcon className="w-3 h-3" />}
                      {k}{done ? ` ${done.band}` : ''}
                    </span>
                  );
                })}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-slate-400">{completed}/4 sections completed</span>
                <button
                  onClick={() => setSelected(test)}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {completed === 0 ? 'Start test' : completed === 4 ? 'Review' : 'Continue'}
                </button>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};

export default MockTests;
