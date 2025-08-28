
import React from 'react';
import BaseSection from './BaseSection';
import { generateReadingTest, evaluateGeneral } from '../services/geminiService';
import { ReadingContent, Question } from '../types';

type Answers = { [key: string]: string };

const renderQuestion = (q: Question, answer: string, onChange: (id: string, value: string) => void) => {
    return (
        <div key={q.id} className="mb-4 p-4 bg-slate-50 rounded-md border">
            <label htmlFor={q.id} className="block font-medium text-slate-700 mb-2">{q.question}</label>
            {q.type === 'multiple_choice' && q.options ? (
                 <select id={q.id} value={answer} onChange={(e) => onChange(q.id, e.target.value)} className="w-full p-2 border rounded-md">
                     <option value="">Select an answer</option>
                     {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                 </select>
            ) : (
                <input type="text" id={q.id} value={answer} onChange={(e) => onChange(q.id, e.target.value)} className="w-full p-2 border rounded-md" />
            )}
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
            renderTest={(content, answers, setAnswers) => (
                <div>
                    <h3 className="text-xl font-bold mb-4 text-slate-800">{content.title}</h3>
                    <div className="prose max-w-none text-slate-700 bg-slate-50 p-4 border rounded-lg max-h-96 overflow-y-auto mb-6">
                       {content.passage.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Questions</h3>
                        {content.questions.map(q => renderQuestion(q, answers[q.id] || '', (id, value) => setAnswers(prev => ({ ...prev, [id]: value })) ))}
                    </div>
                </div>
            )}
        />
    );
};

export default ReadingSection;
