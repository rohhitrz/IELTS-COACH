import React from 'react';
import BaseSection from './BaseSection';
import { generateWritingTest, evaluateWriting } from '../services/apiService';
import { WritingContent } from '../types';

type Answers = { task1: string; task2: string };

const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const WritingSection: React.FC = () => {
    return (
        <BaseSection<WritingContent, Answers>
            sectionTitle="Writing"
            generateTest={generateWritingTest}
            evaluateAnswers={(content, answers) => evaluateWriting(content.task1.prompt, answers.task1, content.task2.prompt, answers.task2)}
            initialAnswers={{ task1: '', task2: '' }}
            duration={3600} // 60 minutes
            renderTest={(content, answers, setAnswers) => (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Task 1</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
                            <p className="text-slate-700 dark:text-slate-300">{content.task1.prompt}</p>
                            <img src={content.task1.imageUrl} alt="Task 1 Chart" className="rounded-md border dark:border-slate-600 shadow-sm mx-auto" />
                            <textarea
                                value={answers.task1}
                                onChange={(e) => setAnswers(prev => ({ ...prev, task1: e.target.value }))}
                                placeholder="Write at least 150 words..."
                                className="w-full h-48 p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                aria-describedby="task1-word-count"
                            />
                             <p id="task1-word-count" className={`text-sm text-right ${countWords(answers.task1) < 150 ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                Word count: {countWords(answers.task1)} {countWords(answers.task1) < 150 && '(Minimum: 150 words)'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Task 2</h3>
                         <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
                            <p className="text-slate-700 dark:text-slate-300">{content.task2.prompt}</p>
                             <textarea
                                value={answers.task2}
                                onChange={(e) => setAnswers(prev => ({ ...prev, task2: e.target.value }))}
                                placeholder="Write at least 250 words..."
                                className="w-full h-64 p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                aria-describedby="task2-word-count"
                            />
                             <p id="task2-word-count" className={`text-sm text-right ${countWords(answers.task2) < 250 ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                Word count: {countWords(answers.task2)} {countWords(answers.task2) < 250 && '(Minimum: 250 words)'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default WritingSection;