import React, { useState } from 'react';
import { MockTest, MockSectionKey, MockTestResults, EvaluationResult } from '../types';
import { buildWritingContent } from '../services/mockTestService';
import { saveMockSectionResult, getMockResults, overallBand, bandOf } from '../services/progressService';
import MockListeningRunner from './MockListeningRunner';
import ReadingSection from './ReadingSection';
import WritingSection from './WritingSection';
import SpeakingSection from './SpeakingSection';
import AnimatedCard from './AnimatedCard';
import { ListeningIcon, ReadingIcon, WritingIcon, SpeakingIcon, CheckCircleIcon, TrophyIcon } from './IconComponents';

interface Props {
  test: MockTest;
  onExit: () => void;
}

const SECTIONS: { key: MockSectionKey; label: string; icon: React.FC<any>; timing: string }[] = [
  { key: 'listening', label: 'Listening', icon: ListeningIcon, timing: '4 parts · 40 questions · ~30 min' },
  { key: 'reading', label: 'Reading', icon: ReadingIcon, timing: '3 passages · 40 questions · 60 min' },
  { key: 'writing', label: 'Writing', icon: WritingIcon, timing: 'Task 1 + Task 2 · 60 min' },
  { key: 'speaking', label: 'Speaking', icon: SpeakingIcon, timing: '3 parts · 11–14 min' },
];

const MockTestRunner: React.FC<Props> = ({ test, onExit }) => {
  const [results, setResults] = useState<MockTestResults>(() => getMockResults()[test.id] || {});
  const [active, setActive] = useState<MockSectionKey | null>(null);

  const recordResult = (section: MockSectionKey, result: EvaluationResult) => {
    const band = bandOf(result);
    saveMockSectionResult(test.id, section, band);
    setResults((prev) => ({ ...prev, [section]: { band, timestamp: Date.now() } }));
  };

  const completedBands = SECTIONS.map((s) => results[s.key]?.band).filter((b): b is number => b !== undefined);
  const allDone = completedBands.length === 4;

  if (active) {
    const draftKey = `mock-${test.id}-${active}`;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActive(null)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          ← Back to {test.title}
        </button>
        {active === 'listening' && (
          <MockListeningRunner content={test.listening} draftKey={draftKey} onEvaluated={(r) => recordResult('listening', r)} />
        )}
        {active === 'reading' && (
          <ReadingSection preset={test.reading} draftKey={draftKey} onEvaluated={(r) => recordResult('reading', r)} />
        )}
        {active === 'writing' && (
          <WritingSection preset={buildWritingContent(test.writing)} draftKey={draftKey} onEvaluated={(r) => recordResult('writing', r)} />
        )}
        {active === 'speaking' && (
          <SpeakingSection preset={test.speaking} onEvaluated={(r) => recordResult('speaking', r)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onExit} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        ← All mock tests
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{test.title}</h2>
        <p className="text-slate-500 dark:text-slate-400">Theme: {test.theme}</p>
      </div>

      {allDone && (
        <AnimatedCard className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600">
          <TrophyIcon className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
          <p className="text-slate-600 dark:text-slate-300 mb-1">Overall Band Score</p>
          <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{overallBand(completedBands)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Average of your four section bands, rounded the IELTS way.
          </p>
        </AnimatedCard>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Complete each section in your own time. Sections can be taken in any order and retaken as often as you like — your latest band for each is kept.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s, i) => {
          const result = results[s.key];
          return (
            <AnimatedCard key={s.key} className="p-5" delay={i * 80}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{s.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.timing}</p>
                  </div>
                </div>
                {result && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-4 h-4" /> {result.band}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActive(s.key)}
                className="w-full mt-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                {result ? 'Retake section' : 'Start section'}
              </button>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
};

export default MockTestRunner;
