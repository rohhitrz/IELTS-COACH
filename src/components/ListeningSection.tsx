import React from 'react';
import BaseSection from './BaseSection';
import { generateListeningTest, evaluateGeneral } from '../services/geminiService';
import { ListeningContent, Question } from '../types';

type Answers = { [key: string]: string };

const renderQuestion = (q: Question, answer: string | undefined, onChange: (id: string, value: string) => void) => {
    return (
        <div key={q.id} className="mb-4">
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

const ListeningSection: React.FC = () => {
    return (
        // <BaseSection<ListeningContent, Answers>
        //     sectionTitle="Listening"
        //     generateTest={generateListeningTest}
        //     evaluateAnswers={(content, answers) => evaluateGeneral('Listening', content, answers)}
        //     initialAnswers={{}}
        //     duration={2400} // 40 minutes
        //     renderTest={(content, answers, setAnswers) => (
        //         <div>
        //             <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg">
        //                 <h3 className="text-lg font-semibold mb-2">Scenario</h3>
        //                 <p className="text-slate-600 dark:text-slate-300">{content.scenario}</p>
        //             </div>
        //             <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto">
        //                 <h3 className="text-lg font-semibold mb-2">Transcript</h3>
        //                 <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{content.transcript}</p>
        //             </div>
        //             <div>
        //                 <h3 className="text-lg font-semibold mb-4">Questions</h3>
        //                 {content.questions.map(q => renderQuestion(q, answers[q.id], (id, value) => setAnswers(prev => ({ ...prev, [id]: value })) ))}
        //             </div>
        //         </div>
        //     )}
        // />
        <h1 className='text-4xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown'>COMING SOON</h1>
    );
};

export default ListeningSection;