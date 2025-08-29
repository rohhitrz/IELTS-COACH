import React, { useState, useCallback, useEffect } from 'react';
import BaseSection from './BaseSection';
import { generateSpeakingTest, evaluateGeneral } from '../services/geminiService';
import { SpeakingContent } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { MicrophoneIcon, StopCircleIcon } from './IconComponents';

type Answers = { part1: { [key: string]: string }, part2: string, part3: { [key: string]: string } };
type RecordingTarget = 
  | { type: 'part1'; index: number }
  | { type: 'part2'; }
  | { type: 'part3'; index: number }
  | null;


const SpeakingSection: React.FC = () => {
    const [answers, setAnswers] = useState<Answers>({ part1: {}, part2: '', part3: {} });
    const [recordingTarget, setRecordingTarget] = useState<RecordingTarget>(null);

    const handleTranscriptChange = useCallback((transcript: string) => {
        if (!recordingTarget) return;

        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (recordingTarget.type === 'part1') {
                const existing = newAnswers.part1[recordingTarget.index] || '';
                newAnswers.part1 = { ...newAnswers.part1, [recordingTarget.index]: existing + transcript + ' ' };
            } else if (recordingTarget.type === 'part2') {
                newAnswers.part2 = prev.part2 + transcript + ' ';
            } else if (recordingTarget.type === 'part3') {
                const existing = newAnswers.part3[recordingTarget.index] || '';
                newAnswers.part3 = { ...newAnswers.part3, [recordingTarget.index]: existing + transcript + ' '};
            }
            return newAnswers;
        });
    }, [recordingTarget]);

    const { isListening, error: speechError, toggleListening, isSupported } = useSpeechToText(handleTranscriptChange);

    const handleRecordClick = (target: RecordingTarget) => {
        if (isListening) {
            toggleListening(); // Stop current recording
            if (JSON.stringify(target) !== JSON.stringify(recordingTarget)) {
                // Start new recording if target is different
                 setRecordingTarget(target);
                 setTimeout(toggleListening, 100); // Give it a moment to stop before starting again
            } else {
                 setRecordingTarget(null);
            }
        } else {
            setRecordingTarget(target);
            toggleListening(); // Start new recording
        }
    };
    
    // Stop listening if component unmounts
    useEffect(() => {
        return () => {
            if (isListening) {
                toggleListening();
            }
        }
    }, [isListening, toggleListening]);


    return (
        <BaseSection<SpeakingContent, Answers>
            sectionTitle="Speaking"
            generateTest={generateSpeakingTest}
            evaluateAnswers={(content, currentAnswers) => evaluateGeneral('Speaking', content, currentAnswers)}
            initialAnswers={{ part1: {}, part2: '', part3: {} }}
            duration={840} // 14 minutes
            renderTest={(content, currentAnswers, setAnswersState) => {
                 // Sync local state with BaseSection's state
                useEffect(() => {
                    setAnswers(currentAnswers);
                }, [currentAnswers]);
                
                 // Sync BaseSection's state with local state
                useEffect(() => {
                    setAnswersState(answers);
                }, [answers, setAnswersState]);

                return (
                <div className="space-y-8">
                    {speechError && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md dark:bg-red-900/30 dark:text-red-300">{speechError}</div>}
                    {!isSupported && <div className="p-3 bg-yellow-100 text-yellow-700 text-sm rounded-md dark:bg-yellow-900/30 dark:text-yellow-300">Your browser does not support speech recognition. Please type your answers.</div>}
                    
                    {/* Part 1 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 1: Introduction and Interview</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
                            <p className="font-medium">Topic: {content.part1.topic}</p>
                            {content.part1.questions.map((q, i) => {
                                const target: RecordingTarget = { type: 'part1', index: i };
                                const isRecordingThis = isListening && JSON.stringify(recordingTarget) === JSON.stringify(target);
                                return (
                                <div key={`p1-${i}`}>
                                    <label className="block text-slate-700 dark:text-slate-300 mb-1">{q}</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Type or record your response..."
                                            value={answers.part1[i] || ''}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, part1: { ...prev.part1, [i]: e.target.value } }))}
                                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                        />
                                        {isSupported && <button onClick={() => handleRecordClick(target)} className={`p-2 rounded-full ${isRecordingThis ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                            {isRecordingThis ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
                                        </button>}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Part 2 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 2: Individual Long Turn</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
                            <p className="font-medium">{content.part2.cueCard}</p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                {content.part2.points.map((p, i) => <li key={`p2-point-${i}`}>{p}</li>)}
                            </ul>
                            <div className="relative">
                               <textarea
                                    placeholder="Prepare your 1-2 minute response here..."
                                    value={answers.part2}
                                    onChange={(e) => setAnswers(prev => ({...prev, part2: e.target.value}))}
                                    className="w-full h-48 p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                />
                                 {isSupported && <button onClick={() => handleRecordClick({type: 'part2'})} className={`absolute bottom-3 right-3 p-2 rounded-full ${isListening && recordingTarget?.type === 'part2' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    {isListening && recordingTarget?.type === 'part2' ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
                                </button>}
                            </div>
                        </div>
                    </div>
                    
                    {/* Part 3 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Part 3: Two-way Discussion</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
                            <p className="font-medium">Discussion Topic: {content.part3.topic}</p>
                            {content.part3.questions.map((q, i) => {
                                const target: RecordingTarget = { type: 'part3', index: i };
                                const isRecordingThis = isListening && JSON.stringify(recordingTarget) === JSON.stringify(target);
                                return (
                                <div key={`p3-${i}`}>
                                    <label className="block text-slate-700 dark:text-slate-300 mb-1">{q}</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Type or record your response..."
                                            value={answers.part3[i] || ''}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, part3: { ...prev.part3, [i]: e.target.value } }))}
                                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                        />
                                        {isSupported && <button onClick={() => handleRecordClick(target)} className={`p-2 rounded-full ${isRecordingThis ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                            {isRecordingThis ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
                                        </button>}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            )}}
        />
    );
};

export default SpeakingSection;