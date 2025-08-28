
import React from 'react';
import BaseSection from './BaseSection';
import { generateWritingTest, evaluateWriting } from '../services/geminiService';
import { WritingContent } from '../types';

type Answers = { task1: string; task2: string };

const WritingSection: React.FC = () => {
    return (
        <BaseSection<WritingContent, Answers>
            sectionTitle="Writing"
            generateTest={generateWritingTest}
            evaluateAnswers={(content, answers) => evaluateWriting(content.task1.prompt, answers.task1, content.task2.prompt, answers.task2)}
            initialAnswers={{ task1: '', task2: '' }}
            renderTest={(content, answers, setAnswers) => (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Task 1</h3>
                        <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                            <p className="text-slate-700">{content.task1.prompt}</p>
                            <img src={content.task1.imageUrl} alt="Task 1 Chart" className="rounded-md border shadow-sm mx-auto" />
                            <textarea
                                value={answers.task1}
                                onChange={(e) => setAnswers(prev => ({ ...prev, task1: e.target.value }))}
                                placeholder="Write at least 150 words..."
                                className="w-full h-48 p-2 border rounded-md"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Task 2</h3>
                         <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                            <p className="text-slate-700">{content.task2.prompt}</p>
                             <textarea
                                value={answers.task2}
                                onChange={(e) => setAnswers(prev => ({ ...prev, task2: e.target.value }))}
                                placeholder="Write at least 250 words..."
                                className="w-full h-64 p-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default WritingSection;
