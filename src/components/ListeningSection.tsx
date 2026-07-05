import React from 'react';
import BaseSection from './BaseSection';
import QuestionInput from './QuestionInput';
import AudioPlayer from './AudioPlayer';
import { generateListeningTest } from '../services/apiService';
import { scoreObjectiveTest } from '../services/scoringService';
import { ListeningContent } from '../types';

type Answers = { [key: string]: string };

const ListeningSection: React.FC = () => {
    return (
        <BaseSection<ListeningContent, Answers>
            sectionTitle="Listening"
            generateTest={generateListeningTest}
            evaluateAnswers={async (content, answers) => scoreObjectiveTest(content.questions, answers, 'category')}
            initialAnswers={{}}
            duration={900} // 15 minutes for one section of 10 questions
            renderTest={(content, answers, setAnswers, isSubmitted) => (
                <div>
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Scenario</h3>
                        <p className="text-slate-600 dark:text-slate-300">{content.scenario}</p>
                    </div>

                    <div className="mb-6">
                        <AudioPlayer text={content.transcript} />
                    </div>

                    {isSubmitted ? (
                        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg max-h-80 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                Read along while re-listening to catch what you missed.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{content.transcript}</p>
                        </div>
                    ) : (
                        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                            The transcript stays hidden until you submit — just like the real exam, rely on your ears.
                        </p>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Questions</h3>
                        {content.questions.map(q => (
                            <QuestionInput
                                key={q.id}
                                question={q}
                                value={answers[q.id] ?? ''}
                                onChange={(id, value) => setAnswers(prev => ({ ...prev, [id]: value }))}
                                disabled={isSubmitted}
                            />
                        ))}
                    </div>
                </div>
            )}
        />
    );
};

export default ListeningSection;
