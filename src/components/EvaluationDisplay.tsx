import React from 'react';
import { EvaluationResult, WritingEvaluation, GeneralEvaluation } from '../types';
import { TrophyIcon, CheckCircleIcon } from './IconComponents';
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

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result }) => {
  const isWritingEval = 'overallBandScore' in result;
  const score = isWritingEval ? (result as WritingEvaluation).overallBandScore : (result as GeneralEvaluation).estimatedBand;
  
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
          {isWritingEval ? 'Overall Band Score' : 'Estimated Band Score'}
        </h4>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
          {getScoreMessage(score)}
        </p>
      </AnimatedCard>

      {/* Detailed Criteria (Writing only) */}
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

      {/* General Feedback (Non-writing sections) */}
      {!isWritingEval && (
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

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" delay={600}>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-green-800 dark:text-green-200 mb-3">Strengths</h4>
              <p className="text-green-700 dark:text-green-300 leading-relaxed">{result.strengths}</p>
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
              <p className="text-orange-700 dark:text-orange-300 leading-relaxed whitespace-pre-wrap">{result.areasForImprovement}</p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default EvaluationDisplay;