
import React from 'react';
import { EvaluationResult, WritingEvaluation, GeneralEvaluation } from '../types';

interface EvaluationDisplayProps {
  result: EvaluationResult;
}

const CriterionCard: React.FC<{ title: string; band: number; feedback: string }> = ({ title, band, feedback }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{band}/9</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{feedback}</p>
    </div>
);

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result }) => {
  const isWritingEval = 'overallBandScore' in result;

  return (
    <div className="space-y-6 mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">Evaluation Report</h3>
      
      {isWritingEval ? (
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase">Overall Band Score</h4>
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">{(result as WritingEvaluation).overallBandScore}</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase">Estimated Band Score</h4>
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">{(result as GeneralEvaluation).estimatedBand}</p>
        </div>
      )}

      {isWritingEval && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CriterionCard title="Task Response" {...(result as WritingEvaluation).taskResponse} />
            <CriterionCard title="Coherence & Cohesion" {...(result as WritingEvaluation).coherenceAndCohesion} />
            <CriterionCard title="Lexical Resource" {...(result as WritingEvaluation).lexicalResource} />
            <CriterionCard title="Grammatical Range & Accuracy" {...(result as WritingEvaluation).grammaticalRangeAndAccuracy} />
        </div>
      )}

      {!isWritingEval && (
          <div>
              <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Feedback</h4>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600">{(result as GeneralEvaluation).feedback}</p>
          </div>
      )}

      <div>
        <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Strengths</h4>
        <p className="text-slate-600 dark:text-green-200 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">{result.strengths}</p>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Areas for Improvement</h4>
        <p className="text-slate-600 dark:text-red-200 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700 whitespace-pre-wrap">{result.areasForImprovement}</p>
      </div>
    </div>
  );
};

export default EvaluationDisplay;
