
import React from 'react';
import BaseSection from './BaseSection';
import { generateSpeakingTest, evaluateGeneral } from '../services/geminiService';
import { SpeakingContent } from '../types';

type Answers = { part1: { [key: string]: string }, part2: string, part3: { [key: string]: string } };

const SpeakingSection: React.FC = () => {
    return (
        <BaseSection<SpeakingContent, Answers>
            sectionTitle="Speaking"
            generateTest={generateSpeakingTest}
            evaluateAnswers={(content, answers) => evaluateGeneral('Speaking', content, answers)}
            initialAnswers={{ part1: {}, part2: '', part3: {} }}
            renderTest={(content, answers, setAnswers) => (
                <div className="space-y-8">
                    {/* Part 1 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 1: Introduction and Interview</h3>
                        <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                            <p className="font-medium">Topic: {content.part1.topic}</p>
                            {content.part1.questions.map((q, i) => (
                                <div key={`p1-${i}`}>
                                    <label className="block text-slate-700 mb-1">{q}</label>
                                    <input
                                        type="text"
                                        placeholder="Type your response here..."
                                        value={answers.part1[i] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, part1: { ...prev.part1, [i]: e.target.value } }))}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Part 2 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 2: Individual Long Turn</h3>
                        <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                            <p className="font-medium">{content.part2.cueCard}</p>
                            <ul className="list-disc list-inside text-slate-600">
                                {content.part2.points.map((p, i) => <li key={`p2-point-${i}`}>{p}</li>)}
                            </ul>
                            <textarea
                                placeholder="Prepare your 1-2 minute response here..."
                                value={answers.part2}
                                onChange={(e) => setAnswers(prev => ({...prev, part2: e.target.value}))}
                                className="w-full h-48 p-2 border rounded-md"
                            />
                        </div>
                    </div>
                    
                    {/* Part 3 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 3: Two-way Discussion</h3>
                        <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                            <p className="font-medium">Discussion Topic: {content.part3.topic}</p>
                            {content.part3.questions.map((q, i) => (
                                <div key={`p3-${i}`}>
                                    <label className="block text-slate-700 mb-1">{q}</label>
                                    <input
                                        type="text"
                                        placeholder="Type your response here..."
                                        value={answers.part3[i] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, part3: { ...prev.part3, [i]: e.target.value } }))}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default SpeakingSection;
