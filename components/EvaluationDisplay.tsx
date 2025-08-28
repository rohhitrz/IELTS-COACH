
import React from 'react';
import { EvaluationResult, WritingEvaluation, GeneralEvaluation } from '../types';

interface EvaluationDisplayProps {
  result: EvaluationResult;
}

const CriterionCard: React.FC<{ title: string; band: number; feedback: string }> = ({ title, band, feedback }) => (
    <div className="bg-slate-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700">{title}</h4>
            <span className="font-bold text-lg text-blue-600">{band}/9</span>
        </div>
        <p className="text-sm text-slate-600">{feedback}</p>
    </div>
);

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result }) => {
  const isWritingEval = 'overallBandScore' in result;

  return (
    <div className="space-y-6 mt-8 p-6 bg-white rounded-xl shadow-sm border">
      <h3 className="text-2xl font-bold text-center text-slate-800">Evaluation Report</h3>
      
      {isWritingEval ? (
        <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 uppercase">Overall Band Score</h4>
            <p className="text-6xl font-bold text-blue-600">{(result as WritingEvaluation).overallBandScore}</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 uppercase">Estimated Band Score</h4>
            <p className="text-6xl font-bold text-blue-600">{(result as GeneralEvaluation).estimatedBand}</p>
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
              <h4 className="font-semibold text-lg text-slate-700 mb-2">Feedback</h4>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border">{(result as GeneralEvaluation).feedback}</p>
          </div>
      )}

      <div>
        <h4 className="font-semibold text-lg text-slate-700 mb-2">Strengths</h4>
        <p className="text-slate-600 bg-green-50 p-4 rounded-lg border border-green-200">{result.strengths}</p>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-slate-700 mb-2">Areas for Improvement</h4>
        <p className="text-slate-600 bg-red-50 p-4 rounded-lg border border-red-200 whitespace-pre-wrap">{result.areasForImprovement}</p>
      </div>
    </div>
  );
};

export default EvaluationDisplay;
