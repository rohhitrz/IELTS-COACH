import React, { useState, useCallback } from 'react';
import { ExamContent, EvaluationResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
import EvaluationDisplay from './EvaluationDisplay';
import { SparklesIcon } from './IconComponents';

interface BaseSectionProps<C extends ExamContent, A> {
    sectionTitle: string;
    generateTest: () => Promise<C>;
    evaluateAnswers: (content: C, answers: A) => Promise<EvaluationResult>;
    // FIX: Update type to allow state setter functions.
    renderTest: (content: C, answers: A, handleAnswerChange: React.Dispatch<React.SetStateAction<A>>) => React.ReactNode;
    initialAnswers: A;
}

const BaseSection = <C extends ExamContent, A>(
  { sectionTitle, generateTest, evaluateAnswers, renderTest, initialAnswers }: BaseSectionProps<C, A>
) => {
    const [content, setContent] = useState<C | null>(null);
    const [answers, setAnswers] = useState<A>(initialAnswers);
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setEvaluation(null);
        setContent(null);
        setAnswers(initialAnswers);
        try {
            const testContent = await generateTest();
            setContent(testContent);
        } catch (err) {
            setError('Failed to generate the test. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [generateTest, initialAnswers]);

    const handleSubmit = async () => {
        if (!content) return;
        setIsEvaluating(true);
        setError(null);
        setEvaluation(null);
        try {
            const result = await evaluateAnswers(content, answers);
            setEvaluation(result);
        } catch (err) {
            setError('Failed to evaluate your answers. Please try again.');
            console.error(err);
        } finally {
            setIsEvaluating(false);
        }
    };
    
    const startNewTest = () => {
        setContent(null);
        setEvaluation(null);
        setError(null);
        setAnswers(initialAnswers);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{sectionTitle} Section</h2>

            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}

            {!content && !isLoading && (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
                    <button
                        onClick={handleGenerateTest}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    >
                       <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate New Test
                    </button>
                </div>
            )}
            
            {isLoading && <LoadingSpinner text="Generating your test..." />}
            
            {content && (
                 <div className="p-6 bg-white rounded-xl shadow-sm border space-y-8">
                     {renderTest(content, answers, setAnswers)}
                     
                     {!evaluation && !isEvaluating && (
                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Submit for Evaluation
                            </button>
                        </div>
                     )}
                     
                     {isEvaluating && <LoadingSpinner text="Our AI examiner is evaluating your answers..." />}
                 </div>
            )}

            {evaluation && (
                <div>
                  <EvaluationDisplay result={evaluation} />
                  <div className="mt-6 text-center">
                       <button
                           onClick={startNewTest}
                           className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                       >
                           Start a New Test
                       </button>
                  </div>
                </div>
            )}
        </div>
    );
};

export default BaseSection;