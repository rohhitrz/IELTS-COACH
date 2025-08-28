
import React from 'react';
import BaseSection from './BaseSection';
import { generateListeningTest, evaluateGeneral } from '../services/geminiService';
import { ListeningContent, Question } from '../types';

type Answers = { [key: string]: string };

const renderQuestion = (q: Question, answer: string, onChange: (id: string, value: string) => void) => {
    return (
        <div key={q.id} className="mb-4">
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

const ListeningSection: React.FC = () => {
    return (
        <BaseSection<ListeningContent, Answers>
            sectionTitle="Listening"
            generateTest={generateListeningTest}
            evaluateAnswers={(content, answers) => evaluateGeneral('Listening', content, answers)}
            initialAnswers={{}}
            renderTest={(content, answers, setAnswers) => (
                <div>
                    <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Scenario</h3>
                        <p className="text-slate-600">{content.scenario}</p>
                    </div>
                    <div className="mb-6 p-4 bg-slate-50 border rounded-lg max-h-60 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                        <p className="text-slate-600 whitespace-pre-wrap">{content.transcript}</p>
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

export default ListeningSection;
