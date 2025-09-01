import React, { useState, useCallback, useEffect } from "react";
import { ExamContent, EvaluationResult } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import EvaluationDisplay from "./EvaluationDisplay";
import Timer from "./Timer";
import ProgressBar from "./ProgressBar";
import AnimatedCard from "./AnimatedCard";
import ConfettiEffect from "./ConfettiEffect";
import Tooltip from "./Tooltip";
import {
  SparklesIcon,
  RefreshIcon,
  CheckCircleIcon,
  TrophyIcon,
  InfoIcon,
} from "./IconComponents";

interface BaseSectionProps<C extends ExamContent, A> {
  sectionTitle: string;
  generateTest: () => Promise<C>;
  evaluateAnswers: (content: C, answers: A) => Promise<EvaluationResult>;
  renderTest: (
    content: C,
    answers: A,
    handleAnswerChange: React.Dispatch<React.SetStateAction<A>>
  ) => React.ReactNode;
  initialAnswers: A;
  duration: number; // Duration in seconds
}

const BaseSection = <C extends ExamContent, A>({
  sectionTitle,
  generateTest,
  evaluateAnswers,
  renderTest,
  initialAnswers,
  duration,
}: BaseSectionProps<C, A>) => {
  const [content, setContent] = useState<C | null>(null);
  const [answers, setAnswers] = useState<A>(initialAnswers);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

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
      setError(
        "Failed to generate the test. Please check your API key and try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [generateTest, initialAnswers]);

  const handleSubmit = useCallback(async () => {
    if (!content || isEvaluating) return;
    setIsEvaluating(true);
    setError(null);
    setEvaluation(null);
    try {
      const result = await evaluateAnswers(content, answers);
      setEvaluation(result);

      // Show confetti for good scores
      const score =
        "overallBandScore" in result
          ? result.overallBandScore
          : result.estimatedBand;
      if (score >= 7) {
        setShowConfetti(true);
      }
    } catch (err) {
      setError("Failed to evaluate your answers. Please try again.");
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  }, [content, answers, evaluateAnswers, isEvaluating]);

  const startNewTest = () => {
    setContent(null);
    setEvaluation(null);
    setError(null);
    setAnswers(initialAnswers);
    setShowConfetti(false);
    setTestProgress(0);
    setTimeSpent(0);
  };

  // Calculate test progress based on answers
  useEffect(() => {
    if (!content || !answers) return;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    // This is a simplified progress calculation - you might want to customize this per section
    if (typeof answers === "object" && answers !== null) {
      const answerValues = Object.values(answers);
      totalQuestions = answerValues.length;
      answeredQuestions = answerValues.filter(
        (answer) =>
          answer && (typeof answer === "string" ? answer.trim() !== "" : true)
      ).length;
    }

    setTestProgress(
      totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    );
  }, [answers, content]);

  // Track time spent
  useEffect(() => {
    if (!content || evaluation) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [content, evaluation]);

  return (
    <div className="space-y-6">
      <ConfettiEffect trigger={showConfetti} />

      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown">
            {sectionTitle} Section
          </h2>
          <Tooltip
            content={`Practice ${sectionTitle.toLowerCase()} skills with AI-generated content`}
          >
            <InfoIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
          </Tooltip>
        </div>

        {content && !evaluation && (
          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4" />
              <span>{Math.round(testProgress)}% Complete</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>
                Time: {Math.floor(timeSpent / 60)}:
                {(timeSpent % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {content && !evaluation && (
        <AnimatedCard className="p-4" delay={200}>
          <ProgressBar
            current={testProgress}
            total={100}
            label="Test Progress"
            color={
              testProgress < 30 ? "red" : testProgress < 70 ? "yellow" : "green"
            }
          />
        </AnimatedCard>
      )}

      {/* Error Display */}
      {error && (
        <AnimatedCard className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
            <InfoIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </AnimatedCard>
      )}

      {/* Generate Test Button */}
      {!content && !isLoading && (
        <AnimatedCard className="text-center p-12" delay={300}>
          <div className="space-y-4">
            <TrophyIcon className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 animate-bounce-slow" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Ready to Practice?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Generate a personalized {sectionTitle.toLowerCase()} test tailored
              to your skill level
            </p>
            <button
              onClick={handleGenerateTest}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <SparklesIcon className="w-6 h-6 mr-3" />
              Generate New Test
            </button>
          </div>
        </AnimatedCard>
      )}

      {isLoading && <LoadingSpinner text="Generating your test..." />}

      {content && (
        <AnimatedCard className="overflow-hidden" delay={400}>
          <Timer
            duration={duration}
            onSubmit={handleSubmit}
            isPaused={isEvaluating || !!evaluation}
          />
          <div className="p-4 sm:p-6 space-y-8">
            {renderTest(content, answers, setAnswers)}

            {!evaluation && !isEvaluating && (
              <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {testProgress < 100 ? (
                    <span>Complete all questions to submit</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Ready to submit!
                    </span>
                  )}
                </div>
                <Tooltip content="Submit your answers for AI evaluation and feedback">
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isEvaluating}
                  >
                    Submit for Evaluation
                  </button>
                </Tooltip>
              </div>
            )}

            {isEvaluating && (
              <LoadingSpinner text="Our AI examiner is evaluating your answers..." />
            )}
          </div>
        </AnimatedCard>
      )}

      {evaluation && (
        <div className="space-y-6">
          <EvaluationDisplay result={evaluation} />
          <AnimatedCard className="text-center p-6" delay={600}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                What's Next?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Tooltip content="Generate a new test to continue practicing">
                  <button
                    onClick={startNewTest}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:from-slate-700 hover:to-slate-800 transform hover:scale-105 transition-all duration-200"
                  >
                    <RefreshIcon className="w-5 h-5 mr-2" />
                    Try Another Test
                  </button>
                </Tooltip>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default BaseSection;
