import React, { useState } from 'react';
import BaseSection from './BaseSection';
import { generateReadingTest, evaluateGeneral } from '../services/apiService';
import { ReadingContent, Question } from '../types';

type Answers = { [key: string]: string };

const renderQuestion = (q: Question, answer: string | undefined, onChange: (id: string, value: string) => void) => {
    return (
        <div key={q.id} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700">
            <label htmlFor={q.id} className="block font-medium text-slate-700 dark:text-slate-300 mb-2">{q.question}</label>
            {q.type === 'multiple_choice' && q.options ? (
                 <select id={q.id} value={answer ?? ''} onChange={(e) => onChange(q.id, e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                     <option value="">Select an answer</option>
                      {/* Defensive check: ensure options is an array, filter out any null/undefined values, and cast each option value to a string before mapping */}
                     {Array.isArray(q.options) && q.options.filter(opt => opt !== null && opt !== undefined).map((opt, i) => {
                        const optionValue = String(opt);
                        return <option key={i} value={optionValue}>{optionValue}</option>;
                     })}
                 </select>
            ) : (
                <input type="text" id={q.id} value={answer ?? ''} onChange={(e) => onChange(q.id, e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
            )}
        </div>
    );
}

const ReadingTestRenderer: React.FC<{
    content: ReadingContent,
    answers: Answers,
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>
}> = ({ content, answers, setAnswers }) => {
    const [activePassageIndex, setActivePassageIndex] = useState(0);

    if (!content.passages || content.passages.length === 0) {
        return <p>No reading passages found.</p>;
    }

    const currentPassage = content.passages[activePassageIndex];
    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div>
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto">
                {content.passages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActivePassageIndex(index)}
                        className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-md flex-shrink-0 ${
                            activePassageIndex === index
                                ? 'bg-white dark:bg-slate-800 border-t border-x border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        Passage {index + 1}
                    </button>
                ))}
            </div>

            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{currentPassage.title}</h3>
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="prose prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-700 rounded-lg lg:max-h-[60vh] overflow-y-auto mb-6 lg:mb-0">
                    {currentPassage.passage.split('\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)}
                </div>
                <div className="lg:max-h-[60vh] overflow-y-auto p-1">
                    <h4 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Questions</h4>
                    {currentPassage.questions.map(q => renderQuestion(q, answers[q.id], handleAnswerChange))}
                </div>
            </div>
        </div>
    );
}


const ReadingSection: React.FC = () => {
    return (
        <BaseSection<ReadingContent, Answers>
            sectionTitle="Reading"
            generateTest={generateReadingTest}
            evaluateAnswers={(content, answers) => evaluateGeneral('Reading', content, answers)}
            initialAnswers={{}}
            duration={3600} // 60 minutes
            renderTest={(content, answers, setAnswers) => (
                <ReadingTestRenderer content={content} answers={answers} setAnswers={setAnswers} />
            )}
        />
    );
};

export default ReadingSection;