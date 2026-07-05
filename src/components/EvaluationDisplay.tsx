import React, { useState } from 'react';
import {
  EvaluationResult,
  WritingEvaluation,
  GeneralEvaluation,
  ObjectiveEvaluation,
  SpeakingEvaluation,
  SentenceSuggestion,
} from '../types';
import { groupLabel } from '../services/scoringService';
import { TrophyIcon, CheckCircleIcon, XIcon, InfoIcon } from './IconComponents';
import AnimatedCard from './AnimatedCard';

interface EvaluationDisplayProps {
  result: EvaluationResult;
}

const CriterionCard: React.FC<{ title: string; band: number; feedback: string; index?: number }> = ({ title, band, feedback, index = 0 }) => {
  const getBandColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 7) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <AnimatedCard className="p-5 hover:shadow-md" delay={index * 100}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{title}</h4>
        <div className={`px-3 py-1 rounded-full font-bold text-lg ${getBandColor(band)}`}>
          {band}/9
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feedback}</p>
    </AnimatedCard>
  );
};

const categoryChipColors: Record<SentenceSuggestion['category'], string> = {
  grammar: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  vocabulary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  coherence: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

const SuggestionList: React.FC<{ title: string; suggestions: SentenceSuggestion[] }> = ({ title, suggestions }) => (
  <AnimatedCard className="p-6" delay={500}>
    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-4">{title}</h4>
    <div className="space-y-4">
      {suggestions.map((s, i) => (
        <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${categoryChipColors[s.category] || categoryChipColors.style}`}>
              {s.category}
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 line-through decoration-red-400/60 mb-1">{s.original}</p>
          <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">{s.improved}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{s.explanation}</p>
        </div>
      ))}
    </div>
  </AnimatedCard>
);

const ModelAnswers: React.FC<{ task1: string; task2: string }> = ({ task1, task2 }) => {
  const [open, setOpen] = useState<'task1' | 'task2' | null>(null);
  const toggle = (task: 'task1' | 'task2') => setOpen(open === task ? null : task);

  return (
    <AnimatedCard className="p-6" delay={550}>
      <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-1">Model Answers (Band 8.5+)</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Compare these with your own responses to see what a high-band answer looks like.</p>
      <div className="space-y-3">
        {([['task1', 'Task 1', task1], ['task2', 'Task 2', task2]] as const).map(([key, label, text]) => (
          <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(key)}
              aria-expanded={open === key}
              className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span>{label} model answer</span>
              <span className="text-slate-400">{open === key ? '−' : '+'}</span>
            </button>
            {open === key && (
              <p className="p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
            )}
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
};

const ObjectiveResultView: React.FC<{ result: ObjectiveEvaluation }> = ({ result }) => (
  <>
    {/* Performance by group */}
    <AnimatedCard className="p-6" delay={300}>
      <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-1">Performance Breakdown</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Where you gained and lost marks — focus your practice on the weakest areas first.</p>
      <div className="space-y-3">
        {result.breakdown.map((b) => {
          const pct = b.total > 0 ? (b.correct / b.total) * 100 : 0;
          const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={b.group}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700 dark:text-slate-300">{groupLabel(b.group)}</span>
                <span className="text-slate-500 dark:text-slate-400">{b.correct}/{b.total}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedCard>

    {/* Answer review */}
    <AnimatedCard className="p-6" delay={400}>
      <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-4">Answer Review</h4>
      <div className="space-y-4">
        {result.review.map((r, i) => (
          <div
            key={r.id}
            className={`p-4 rounded-lg border ${
              r.isCorrect
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start space-x-3">
              {r.isCorrect ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-2">
                  {i + 1}. {r.question}
                </p>
                <div className="text-sm space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">
                    Your answer: <span className={r.isCorrect ? 'text-green-700 dark:text-green-300 font-medium' : 'text-red-700 dark:text-red-300 font-medium'}>{r.userAnswer || '(no answer)'}</span>
                  </p>
                  {!r.isCorrect && (
                    <p className="text-slate-600 dark:text-slate-400">
                      Correct answer: <span className="text-green-700 dark:text-green-300 font-medium">{r.correctAnswer}</span>
                    </p>
                  )}
                  {r.explanation && (
                    <p className="text-slate-500 dark:text-slate-400 pt-1 flex items-start">
                      <InfoIcon className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                      <span>{r.explanation}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  </>
);

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result }) => {
  const isWritingEval = 'taskResponse' in result;
  const isSpeakingEval = 'fluencyAndCoherence' in result;
  const isObjectiveEval = 'review' in result;

  const score = 'overallBandScore' in result ? result.overallBandScore : result.estimatedBand;
  const strengths = 'strengths' in result ? result.strengths : null;
  const areasForImprovement = 'areasForImprovement' in result ? result.areasForImprovement : null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-600';
    if (score >= 7) return 'from-blue-500 to-indigo-600';
    if (score >= 6) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 8) return 'Excellent! 🎉';
    if (score >= 7) return 'Great job! 👏';
    if (score >= 6) return 'Good work! 👍';
    return 'Keep practicing! 💪';
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Header */}
      <AnimatedCard className="text-center p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600">
        <div className="flex justify-center mb-4">
          <TrophyIcon className="w-12 h-12 text-yellow-500 animate-bounce-slow" />
        </div>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Evaluation Complete!
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Here's your detailed performance analysis
        </p>
      </AnimatedCard>

      {/* Score Display */}
      <AnimatedCard className="text-center p-8" delay={200}>
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(score)} shadow-lg mb-4`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{score}</div>
            <div className="text-sm text-white/80">/ 9</div>
          </div>
        </div>
        <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          {isWritingEval || isSpeakingEval ? 'Overall Band Score' : 'Estimated Band Score'}
        </h4>
        {isObjectiveEval && (
          <p className="text-slate-600 dark:text-slate-300 mb-1">
            {(result as ObjectiveEvaluation).correctCount} of {(result as ObjectiveEvaluation).totalCount} questions correct
          </p>
        )}
        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
          {getScoreMessage(score)}
        </p>
      </AnimatedCard>

      {/* Objective (Listening/Reading): breakdown + answer review */}
      {isObjectiveEval && <ObjectiveResultView result={result as ObjectiveEvaluation} />}

      {/* Detailed Criteria (Writing) */}
      {isWritingEval && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-center">
            Detailed Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CriterionCard title="Task Response" {...(result as WritingEvaluation).taskResponse} index={0} />
            <CriterionCard title="Coherence & Cohesion" {...(result as WritingEvaluation).coherenceAndCohesion} index={1} />
            <CriterionCard title="Lexical Resource" {...(result as WritingEvaluation).lexicalResource} index={2} />
            <CriterionCard title="Grammatical Range & Accuracy" {...(result as WritingEvaluation).grammaticalRangeAndAccuracy} index={3} />
          </div>
        </div>
      )}

      {/* Detailed Criteria (Speaking) */}
      {isSpeakingEval && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-center">
            Detailed Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CriterionCard title="Fluency & Coherence" {...(result as SpeakingEvaluation).fluencyAndCoherence} index={0} />
            <CriterionCard title="Lexical Resource" {...(result as SpeakingEvaluation).lexicalResource} index={1} />
            <CriterionCard title="Grammatical Range & Accuracy" {...(result as SpeakingEvaluation).grammaticalRangeAndAccuracy} index={2} />
            <CriterionCard title="Pronunciation" {...(result as SpeakingEvaluation).pronunciation} index={3} />
          </div>
          {(result as SpeakingEvaluation).paceAnalysis && (
            <AnimatedCard className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" delay={450}>
              <h4 className="font-semibold text-lg text-blue-800 dark:text-blue-200 mb-2">Pace & Delivery</h4>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed text-sm">{(result as SpeakingEvaluation).paceAnalysis}</p>
            </AnimatedCard>
          )}
        </div>
      )}

      {/* General Feedback (legacy stored results) */}
      {!isWritingEval && !isSpeakingEval && !isObjectiveEval && (
        <AnimatedCard className="p-6" delay={400}>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-3">Detailed Feedback</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{(result as GeneralEvaluation).feedback}</p>
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Detailed Analysis (Writing only) */}
      {isWritingEval && (result as WritingEvaluation).wordCountAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" delay={500}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">W</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-blue-800 dark:text-blue-200 mb-3">Word Count Analysis</h4>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">{(result as WritingEvaluation).wordCountAnalysis}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800" delay={550}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">E</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-purple-800 dark:text-purple-200 mb-3">Error Analysis</h4>
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed">{(result as WritingEvaluation).errorAnalysis}</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Sentence-level suggestions (Writing) */}
      {isWritingEval && !!(result as WritingEvaluation).sentenceSuggestions?.length && (
        <SuggestionList title="Sentence-Level Improvements" suggestions={(result as WritingEvaluation).sentenceSuggestions!} />
      )}

      {/* Spoken corrections (Speaking) */}
      {isSpeakingEval && !!(result as SpeakingEvaluation).corrections?.length && (
        <SuggestionList title="Corrections From Your Answers" suggestions={(result as SpeakingEvaluation).corrections!} />
      )}

      {/* Model answers (Writing) */}
      {isWritingEval && (result as WritingEvaluation).modelAnswers && (
        <ModelAnswers {...(result as WritingEvaluation).modelAnswers!} />
      )}

      {/* Strengths and Improvements */}
      {strengths && areasForImprovement && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" delay={600}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-green-800 dark:text-green-200 mb-3">Strengths</h4>
                <p className="text-green-700 dark:text-green-300 leading-relaxed">{strengths}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800" delay={700}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-orange-800 dark:text-orange-200 mb-3">Areas for Improvement</h4>
                <p className="text-orange-700 dark:text-orange-300 leading-relaxed whitespace-pre-wrap">{areasForImprovement}</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default EvaluationDisplay;
