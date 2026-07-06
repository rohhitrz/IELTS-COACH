import React, { useState } from 'react';
import BaseSection from './BaseSection';
import QuestionInput from './QuestionInput';
import AudioPlayer from './AudioPlayer';
import { scoreObjectiveTest } from '../services/scoringService';
import { MockListeningContent, EvaluationResult } from '../types';

type Answers = { [key: string]: string };

interface Props {
  content: MockListeningContent;
  draftKey: string;
  onEvaluated: (result: EvaluationResult) => void;
}

/** Runs a full 4-part / 40-question mock listening test through the shared BaseSection engine. */
const MockListeningRunner: React.FC<Props> = ({ content, draftKey, onEvaluated }) => {
  const allQuestions = content.parts.flatMap((p) => p.questions);

  return (
    <BaseSection<MockListeningContent, Answers>
      sectionTitle="Listening"
      presetContent={content}
      draftKey={draftKey}
      onEvaluated={onEvaluated}
      evaluateAnswers={async (c, answers) =>
        scoreObjectiveTest(c.parts.flatMap((p) => p.questions), answers, 'category')
      }
      initialAnswers={{}}
      duration={1800} // 30 minutes for the full 40-question test
      renderTest={(c, answers, setAnswers, isSubmitted) => (
        <PartsView content={c} answers={answers} setAnswers={setAnswers} isSubmitted={isSubmitted} totalQuestions={allQuestions.length} />
      )}
    />
  );
};

const PartsView: React.FC<{
  content: MockListeningContent;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  isSubmitted: boolean;
  totalQuestions: number;
}> = ({ content, answers, setAnswers, isSubmitted }) => {
  const [activePart, setActivePart] = useState(0);
  const part = content.parts[activePart];
  let questionOffset = content.parts.slice(0, activePart).reduce((sum, p) => sum + p.questions.length, 0);

  return (
    <div>
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto">
        {content.parts.map((p, i) => {
          const answered = p.questions.filter((q) => answers[q.id]?.trim()).length;
          return (
            <button
              key={i}
              onClick={() => setActivePart(i)}
              className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-md flex-shrink-0 ${
                activePart === i
                  ? 'bg-white dark:bg-slate-800 border-t border-x border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              Part {i + 1}
              <span className="ml-1.5 text-xs opacity-70">{answered}/{p.questions.length}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-1">{part.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">{part.scenario}</p>
      </div>

      <div className="mb-6">
        <AudioPlayer key={activePart} text={part.transcript} />
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg max-h-72 overflow-y-auto">
          <h4 className="font-semibold mb-2">Transcript — Part {activePart + 1}</h4>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm">{part.transcript}</p>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold mb-4">Questions {questionOffset + 1}–{questionOffset + part.questions.length}</h4>
        {part.questions.map((q) => (
          <QuestionInput
            key={q.id}
            question={q}
            value={answers[q.id] ?? ''}
            onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
            disabled={isSubmitted}
          />
        ))}
      </div>
    </div>
  );
};

export default MockListeningRunner;
