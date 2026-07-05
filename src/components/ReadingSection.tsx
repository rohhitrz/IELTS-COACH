import React, { useState } from 'react';
import BaseSection from './BaseSection';
import QuestionInput from './QuestionInput';
import WordLookup from './WordLookup';
import { generateReadingTest } from '../services/apiService';
import { scoreObjectiveTest } from '../services/scoringService';
import { ReadingContent } from '../types';

type Answers = { [key: string]: string };

const ReadingTestRenderer: React.FC<{
    content: ReadingContent,
    answers: Answers,
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>,
    isSubmitted: boolean
}> = ({ content, answers, setAnswers, isSubmitted }) => {
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

            <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">{currentPassage.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Tip: select any word in the passage to look up its meaning.
            </p>
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <WordLookup>
                    <div className="prose prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-700 rounded-lg lg:max-h-[60vh] overflow-y-auto mb-6 lg:mb-0">
                        {currentPassage.passage.split('\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)}
                    </div>
                </WordLookup>
                <div className="lg:max-h-[60vh] overflow-y-auto p-1">
                    <h4 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Questions</h4>
                    {currentPassage.questions.map(q => (
                        <QuestionInput
                            key={q.id}
                            question={q}
                            value={answers[q.id] ?? ''}
                            onChange={handleAnswerChange}
                            disabled={isSubmitted}
                        />
                    ))}
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
            evaluateAnswers={async (content, answers) =>
                scoreObjectiveTest(content.passages.flatMap(p => p.questions), answers, 'type')
            }
            initialAnswers={{}}
            duration={3600} // 60 minutes
            renderTest={(content, answers, setAnswers, isSubmitted) => (
                <ReadingTestRenderer content={content} answers={answers} setAnswers={setAnswers} isSubmitted={isSubmitted} />
            )}
        />
    );
};

export default ReadingSection;
