import React, { useState } from 'react';
import { Attempt, ExamSection, ObjectiveEvaluation, WritingEvaluation, SpeakingEvaluation, GroupBreakdown } from '../types';
import { getAttempts, getStreak, practicedToday, deleteAttempt } from '../services/progressService';
import { groupLabel } from '../services/scoringService';
import EvaluationDisplay from './EvaluationDisplay';
import AnimatedCard from './AnimatedCard';
import { FlameIcon, ChartBarIcon, CheckCircleIcon, TrophyIcon, XIcon, SparklesIcon } from './IconComponents';

const SECTIONS: Attempt['section'][] = ['Listening', 'Reading', 'Writing', 'Speaking'];

const sectionColors: Record<Attempt['section'], string> = {
  Listening: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Reading: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Writing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Speaking: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
const fmt1 = (n: number) => n.toFixed(1);

interface Weakness {
  label: string;
  detail: string;
  pct: number; // success percentage, lower = weaker
}

/** Aggregates recurring weaknesses across all stored attempts. */
function computeWeaknesses(attempts: Attempt[]): Weakness[] {
  const weaknesses: Weakness[] = [];

  // Objective sections: merge group breakdowns across attempts
  for (const section of ['Listening', 'Reading'] as const) {
    const groups = new Map<string, GroupBreakdown>();
    for (const a of attempts.filter((a) => a.section === section)) {
      const result = a.result as ObjectiveEvaluation;
      if (!('breakdown' in result)) continue;
      for (const b of result.breakdown) {
        const entry = groups.get(b.group) || { group: b.group, correct: 0, total: 0 };
        entry.correct += b.correct;
        entry.total += b.total;
        groups.set(b.group, entry);
      }
    }
    for (const g of groups.values()) {
      if (g.total >= 3) {
        const pct = (g.correct / g.total) * 100;
        if (pct < 70) {
          weaknesses.push({
            label: `${section}: ${groupLabel(g.group)}`,
            detail: `${g.correct}/${g.total} correct across your sessions`,
            pct,
          });
        }
      }
    }
  }

  // Criteria-based sections: find the weakest averaged criterion
  const criteriaOf = (a: Attempt): [string, number][] => {
    if ('taskResponse' in a.result) {
      const r = a.result as WritingEvaluation;
      return [
        ['Task Response', r.taskResponse.band],
        ['Coherence & Cohesion', r.coherenceAndCohesion.band],
        ['Lexical Resource', r.lexicalResource.band],
        ['Grammar', r.grammaticalRangeAndAccuracy.band],
      ];
    }
    if ('fluencyAndCoherence' in a.result) {
      const r = a.result as SpeakingEvaluation;
      return [
        ['Fluency & Coherence', r.fluencyAndCoherence.band],
        ['Lexical Resource', r.lexicalResource.band],
        ['Grammar', r.grammaticalRangeAndAccuracy.band],
        ['Pronunciation', r.pronunciation.band],
      ];
    }
    return [];
  };

  for (const section of ['Writing', 'Speaking'] as const) {
    const sums = new Map<string, number[]>();
    for (const a of attempts.filter((a) => a.section === section)) {
      for (const [name, band] of criteriaOf(a)) {
        sums.set(name, [...(sums.get(name) || []), band]);
      }
    }
    let worst: { name: string; mean: number } | null = null;
    for (const [name, bands] of sums) {
      const mean = avg(bands);
      if (!worst || mean < worst.mean) worst = { name, mean };
    }
    if (worst && worst.mean < 7) {
      weaknesses.push({
        label: `${section}: ${worst.name}`,
        detail: `Averaging band ${fmt1(worst.mean)} — your weakest ${section.toLowerCase()} criterion`,
        pct: (worst.mean / 9) * 100,
      });
    }
  }

  return weaknesses.sort((a, b) => a.pct - b.pct).slice(0, 5);
}

const TrendBars: React.FC<{ bands: number[] }> = ({ bands }) => (
  <div className="flex items-end space-x-1 h-10" aria-hidden="true">
    {bands.map((b, i) => (
      <div
        key={i}
        className={`w-2 rounded-sm ${b >= 7 ? 'bg-green-400' : b >= 6 ? 'bg-yellow-400' : 'bg-red-400'}`}
        style={{ height: `${Math.max((b / 9) * 100, 8)}%` }}
        title={`Band ${b}`}
      />
    ))}
  </div>
);

interface DashboardProps {
  onNavigate: (section: ExamSection) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<Attempt[]>(getAttempts);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const streak = getStreak(attempts);
  const doneToday = practicedToday(attempts);

  const handleDelete = (id: string) => {
    deleteAttempt(id);
    setAttempts((prev) => prev.filter((a) => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  if (attempts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown">Dashboard</h2>
        <AnimatedCard className="text-center p-12">
          <ChartBarIcon className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No practice sessions yet</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
            Complete a test in any section and your scores, progress trends, and weak areas will show up here.
          </p>
          <button
            onClick={() => onNavigate(ExamSection.WRITING)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Start Practicing
          </button>
        </AnimatedCard>
      </div>
    );
  }

  const weaknesses = computeWeaknesses(attempts);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown">Dashboard</h2>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard className="p-5 text-center" delay={0}>
          <FlameIcon className={`w-8 h-8 mx-auto mb-2 ${streak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{streak}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Day streak</div>
        </AnimatedCard>
        <AnimatedCard className="p-5 text-center" delay={100}>
          <CheckCircleIcon className={`w-8 h-8 mx-auto mb-2 ${doneToday ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`} />
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{doneToday ? 'Done' : 'Not yet'}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Daily goal: 1 session</div>
        </AnimatedCard>
        <AnimatedCard className="p-5 text-center" delay={200}>
          <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{attempts.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total sessions</div>
        </AnimatedCard>
        <AnimatedCard className="p-5 text-center" delay={300}>
          <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{fmt1(avg(attempts.map((a) => a.band)))}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Average band</div>
        </AnimatedCard>
      </div>

      {/* Per-module summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map((section, i) => {
          const sectionAttempts = attempts.filter((a) => a.section === section);
          const bands = sectionAttempts.map((a) => a.band).reverse(); // oldest → newest
          return (
            <AnimatedCard key={section} className="p-5" delay={400 + i * 100}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sectionColors[section]}`}>{section}</span>
                <span className="text-xs text-slate-400">{sectionAttempts.length} session{sectionAttempts.length === 1 ? '' : 's'}</span>
              </div>
              {sectionAttempts.length > 0 ? (
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{fmt1(avg(bands))}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">avg band · last {bands[bands.length - 1]}</div>
                  </div>
                  <TrendBars bands={bands.slice(-8)} />
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">Not practiced yet</p>
              )}
            </AnimatedCard>
          );
        })}
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <AnimatedCard className="p-6" delay={800}>
          <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-1">Focus Areas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Recurring weak spots across your practice history — spend your next sessions here.
          </p>
          <div className="space-y-3">
            {weaknesses.map((w) => (
              <div key={w.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{w.label}</span>
                  <span className="text-slate-500 dark:text-slate-400">{w.detail}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${w.pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.max(w.pct, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Session history */}
      <AnimatedCard className="p-6" delay={900}>
        <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/40">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${sectionColors[a.section]}`}>{a.section}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {new Date(a.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    {' · '}
                    {new Date(a.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Band {a.band}</span>
                  <button
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {expandedId === a.id ? 'Hide' : 'Review'}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label="Delete session"
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === a.id && (
                <div className="p-4">
                  <EvaluationDisplay result={a.result} />
                </div>
              )}
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Dashboard;
