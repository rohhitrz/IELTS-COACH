import React from 'react';
import { Question } from '../types';

interface QuestionInputProps {
  question: Question;
  value: string;
  onChange: (id: string, value: string) => void;
  disabled?: boolean;
}

const TFNG_OPTIONS = ['True', 'False', 'Not Given'];

/**
 * Renders the right input control for an IELTS question type:
 * a select for anything with fixed choices, a text input otherwise.
 */
const QuestionInput: React.FC<QuestionInputProps> = ({ question: q, value, onChange, disabled }) => {
  const options =
    q.type === 'true_false_not_given'
      ? TFNG_OPTIONS
      : Array.isArray(q.options) && q.options.length > 0
        ? q.options.filter((opt) => opt !== null && opt !== undefined).map(String)
        : null;

  const inputClasses =
    'w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700">
      <label htmlFor={q.id} className="block font-medium text-slate-700 dark:text-slate-300 mb-2">
        {q.question}
      </label>
      {options ? (
        <select
          id={q.id}
          value={value}
          onChange={(e) => onChange(q.id, e.target.value)}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select an answer</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id={q.id}
          value={value}
          onChange={(e) => onChange(q.id, e.target.value)}
          disabled={disabled}
          placeholder={q.type === 'sentence_completion' || q.type === 'short_answer' ? 'No more than three words' : undefined}
          className={inputClasses}
        />
      )}
    </div>
  );
};

export default QuestionInput;
