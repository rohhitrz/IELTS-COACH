import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeakingTest, evaluateSpeaking, evaluatePronunciation } from '../services/apiService';
import { countWords, countFillerWords } from '../services/scoringService';
import { saveAttempt } from '../services/progressService';
import { SpeakingContent, SpeakingEvaluation, SpeakingMetrics } from '../types';
import { useAudioRecorder, RecordingResult } from '../hooks/useAudioRecorder';
import LoadingSpinner from './LoadingSpinner';
import EvaluationDisplay from './EvaluationDisplay';
import AnimatedCard from './AnimatedCard';
import ConfettiEffect from './ConfettiEffect';
import {
  MicrophoneIcon,
  StopCircleIcon,
  SparklesIcon,
  RefreshIcon,
  InfoIcon,
  TrophyIcon,
} from './IconComponents';

const PART2_PREP_SEC = 60;
const PART2_SPEAK_SEC = 120;

interface AnswerRecord {
  transcript: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
  durationSec: number;
}

type AnswersMap = Record<string, AnswerRecord>;

const emptyAnswer: AnswerRecord = { transcript: '', audioUrl: null, audioBlob: null, durationSec: 0 };

const formatSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const SpeakingSection: React.FC = () => {
  const [content, setContent] = useState<SpeakingContent | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [part2Phase, setPart2Phase] = useState<'idle' | 'prep' | 'recording' | 'done'>('idle');
  const [prepRemaining, setPrepRemaining] = useState(PART2_PREP_SEC);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [pronunciationFromAudio, setPronunciationFromAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAction, setFailedAction] = useState<'generate' | 'evaluate' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const activeTargetRef = useRef<string | null>(null);
  activeTargetRef.current = activeTarget;

  const handleRecordingFinish = useCallback((result: RecordingResult) => {
    const target = activeTargetRef.current;
    if (!target) return;
    setAnswers((prev) => {
      const existing = prev[target] || emptyAnswer;
      if (existing.audioUrl) URL.revokeObjectURL(existing.audioUrl);
      return {
        ...prev,
        [target]: {
          transcript: (existing.transcript + ' ' + result.transcript).trim(),
          audioUrl: result.audioUrl,
          audioBlob: result.audioBlob,
          durationSec: existing.durationSec + result.durationSec,
        },
      };
    });
    setActiveTarget(null);
    setPart2Phase((phase) => (target === 'p2' && phase === 'recording' ? 'done' : phase));
  }, []);

  const recorder = useAudioRecorder(handleRecordingFinish);

  // Part 2 preparation countdown → auto-start the recording
  useEffect(() => {
    if (part2Phase !== 'prep') return;
    if (prepRemaining <= 0) {
      setPart2Phase('recording');
      setActiveTarget('p2');
      recorder.start(PART2_SPEAK_SEC);
      return;
    }
    const t = setTimeout(() => setPrepRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Phase, prepRemaining]);

  // Revoke replay URLs when leaving the page
  useEffect(() => () => {
    Object.values(answers).forEach((a) => a.audioUrl && URL.revokeObjectURL(a.audioUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setFailedAction(null);
    try {
      const test = await generateSpeakingTest();
      setContent(test);
      setAnswers({});
      setEvaluation(null);
      setPart2Phase('idle');
      setPrepRemaining(PART2_PREP_SEC);
    } catch (err) {
      setError('Failed to generate the test. This is usually a temporary issue with the AI service.');
      setFailedAction('generate');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecord = (key: string, maxSec?: number) => {
    if (recorder.isRecording) {
      if (activeTarget === key) recorder.stop();
      return; // don't allow starting a second recording mid-recording
    }
    setActiveTarget(key);
    recorder.start(maxSec);
  };

  const setTranscript = (key: string, transcript: string) => {
    setAnswers((prev) => ({ ...prev, [key]: { ...(prev[key] || emptyAnswer), transcript } }));
  };

  const startPart2Prep = () => {
    setPrepRemaining(PART2_PREP_SEC);
    setPart2Phase('prep');
  };

  const buildMetrics = (): SpeakingMetrics => {
    const records = Object.values(answers);
    const totalDurationSec = records.reduce((sum, r) => sum + r.durationSec, 0);
    const allText = records.map((r) => r.transcript).join(' ');
    const totalWords = countWords(allText);
    return {
      totalDurationSec,
      totalWords,
      wordsPerMinute: totalDurationSec > 0 ? Math.round(totalWords / (totalDurationSec / 60)) : 0,
      fillerWords: countFillerWords(allText),
    };
  };

  const answeredCount = Object.values(answers).filter((a) => a.transcript.trim()).length;

  const handleSubmit = async () => {
    if (!content || isEvaluating || answeredCount === 0) return;
    if (recorder.isRecording) recorder.stop();
    setIsEvaluating(true);
    setError(null);
    setFailedAction(null);
    try {
      const answersShape = {
        part1: Object.fromEntries(
          content.part1.questions.map((q, i) => [q, answers[`p1-${i}`]?.transcript || '(no answer)'])
        ),
        part2: answers['p2']?.transcript || '(no answer)',
        part3: Object.fromEntries(
          content.part3.questions.map((q, i) => [q, answers[`p3-${i}`]?.transcript || '(no answer)'])
        ),
      };

      // Pronunciation from the real Part 2 audio, in parallel with the main evaluation.
      // Base64 expands audio ~4/3; the API caps payloads near 4MB.
      const p2Blob = answers['p2']?.audioBlob;
      const pronunciationPromise =
        p2Blob && p2Blob.size < 2_500_000
          ? blobToBase64(p2Blob).then((b64) => evaluatePronunciation(b64, p2Blob.type, content.part2.cueCard))
          : Promise.reject(new Error('no suitable audio'));

      const [evalResult, pronResult] = await Promise.allSettled([
        evaluateSpeaking(content, answersShape, buildMetrics()),
        pronunciationPromise,
      ]);

      if (evalResult.status === 'rejected') throw evalResult.reason;
      const result = { ...evalResult.value };

      if (pronResult.status === 'fulfilled') {
        const pron = pronResult.value;
        result.pronunciation = {
          band: pron.band,
          feedback: `${pron.feedback}${pron.examples?.length ? '\n\nExamples from your recording: ' + pron.examples.join('; ') : ''}`,
        };
        // Recompute the overall band now that pronunciation is audio-based
        const bands = [result.fluencyAndCoherence.band, result.lexicalResource.band, result.grammaticalRangeAndAccuracy.band, pron.band];
        result.overallBandScore = Math.round((bands.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
        setPronunciationFromAudio(true);
      } else {
        setPronunciationFromAudio(false);
      }

      setEvaluation(result);
      saveAttempt('Speaking', result);
      if (result.overallBandScore >= 7) setShowConfetti(true);
    } catch (err) {
      setError('Failed to evaluate your answers. Your recordings are still here — you can retry.');
      setFailedAction('evaluate');
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const startNewTest = () => {
    Object.values(answers).forEach((a) => a.audioUrl && URL.revokeObjectURL(a.audioUrl));
    setContent(null);
    setAnswers({});
    setEvaluation(null);
    setError(null);
    setFailedAction(null);
    setPart2Phase('idle');
    setShowConfetti(false);
  };

  const renderAnswerBox = (key: string, maxSec?: number) => {
    const record = answers[key] || emptyAnswer;
    const isRecordingThis = recorder.isRecording && activeTarget === key;
    const wpm = record.durationSec > 0 ? Math.round(countWords(record.transcript) / (record.durationSec / 60)) : null;

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <textarea
            value={isRecordingThis ? recorder.liveTranscript : record.transcript}
            onChange={(e) => setTranscript(key, e.target.value)}
            readOnly={isRecordingThis}
            placeholder={isRecordingThis ? 'Listening…' : 'Record your answer, or type it here…'}
            rows={key === 'p2' ? 6 : 2}
            className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-sm disabled:opacity-60"
            disabled={!!evaluation}
            aria-label="Your answer"
          />
          {!evaluation && (
            <button
              onClick={() => toggleRecord(key, maxSec)}
              disabled={recorder.isRecording && activeTarget !== key}
              aria-label={isRecordingThis ? 'Stop recording' : 'Start recording'}
              className={`p-3 rounded-full flex-shrink-0 transition-colors disabled:opacity-40 ${
                isRecordingThis
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isRecordingThis ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 min-h-[1rem]">
          {isRecordingThis && <span className="text-red-500 font-medium">● Recording {formatSec(recorder.elapsedSec)}</span>}
          {!isRecordingThis && record.durationSec > 0 && <span>Duration {formatSec(record.durationSec)}</span>}
          {!isRecordingThis && wpm !== null && <span>{wpm} words/min</span>}
          {!isRecordingThis && record.audioUrl && (
            <audio controls src={record.audioUrl} className="h-8 max-w-full" preload="none" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ConfettiEffect trigger={showConfetti} />

      <div className="flex items-center space-x-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInDown">
          Speaking Section
        </h2>
      </div>

      {error && (
        <AnimatedCard className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <InfoIcon className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {failedAction && (
              <button
                onClick={failedAction === 'evaluate' ? handleSubmit : handleGenerate}
                className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Retry
              </button>
            )}
          </div>
        </AnimatedCard>
      )}

      {recorder.error && (
        <AnimatedCard className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{recorder.error}</p>
        </AnimatedCard>
      )}

      {!content && !isLoading && (
        <AnimatedCard className="text-center p-12" delay={300}>
          <div className="space-y-4">
            <TrophyIcon className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 animate-bounce-slow" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Ready to Practice?</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              A full three-part speaking test: interview questions, a timed cue-card long turn, and a discussion.
              Your answers are recorded so you can replay them and get pronunciation feedback.
            </p>
            {!recorder.isTranscriptionSupported && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your browser doesn't support speech-to-text — use Chrome or Edge for the full experience, or type your answers.
              </p>
            )}
            <button
              onClick={handleGenerate}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200"
            >
              <SparklesIcon className="w-6 h-6 mr-3" />
              Generate New Test
            </button>
          </div>
        </AnimatedCard>
      )}

      {isLoading && <LoadingSpinner text="Generating your speaking test..." />}

      {content && (
        <AnimatedCard className="p-4 sm:p-6 space-y-8" delay={200}>
          {/* Part 1 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Part 1: Introduction and Interview</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-5">
              <p className="font-medium text-slate-700 dark:text-slate-300">Topic: {content.part1.topic}</p>
              {content.part1.questions.map((q, i) => (
                <div key={`p1-${i}`}>
                  <p className="text-slate-700 dark:text-slate-300 mb-1.5 text-sm font-medium">{q}</p>
                  {renderAnswerBox(`p1-${i}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Part 2 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Part 2: Individual Long Turn</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-4">
              <p className="font-medium text-slate-700 dark:text-slate-300">{content.part2.cueCard}</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-sm">
                {content.part2.points.map((p, i) => <li key={`p2-point-${i}`}>{p}</li>)}
              </ul>

              {part2Phase === 'idle' && !evaluation && !answers['p2']?.transcript && (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    You'll get 1 minute to prepare (make notes if you like), then the recording starts
                    automatically and stops after 2 minutes — just like the real exam.
                  </p>
                  <button
                    onClick={startPart2Prep}
                    disabled={recorder.isRecording}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  >
                    Start 1-Minute Preparation
                  </button>
                </div>
              )}

              {part2Phase === 'prep' && (
                <div className="text-center py-4" role="timer" aria-live="polite">
                  <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {formatSec(prepRemaining)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Preparation time — recording starts automatically when it reaches zero
                  </p>
                  <button
                    onClick={() => setPrepRemaining(0)}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    I'm ready — start speaking now
                  </button>
                </div>
              )}

              {(part2Phase === 'recording' || part2Phase === 'done' || answers['p2']?.transcript || evaluation) && part2Phase !== 'prep' && (
                <div>
                  {part2Phase === 'recording' && (
                    <p className="text-sm text-red-500 font-medium mb-2" aria-live="polite">
                      Speak for up to 2 minutes — recording stops automatically at {formatSec(PART2_SPEAK_SEC)}.
                    </p>
                  )}
                  {renderAnswerBox('p2', PART2_SPEAK_SEC)}
                </div>
              )}
            </div>
          </div>

          {/* Part 3 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Part 3: Two-way Discussion</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-700 rounded-lg space-y-5">
              <p className="font-medium text-slate-700 dark:text-slate-300">Discussion Topic: {content.part3.topic}</p>
              {content.part3.questions.map((q, i) => (
                <div key={`p3-${i}`}>
                  <p className="text-slate-700 dark:text-slate-300 mb-1.5 text-sm font-medium">{q}</p>
                  {renderAnswerBox(`p3-${i}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          {!evaluation && !isEvaluating && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {answeredCount === 0
                  ? 'Answer at least one question to submit'
                  : `${answeredCount} answer${answeredCount === 1 ? '' : 's'} recorded`}
              </span>
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0 || recorder.isRecording}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Submit for Evaluation
              </button>
            </div>
          )}

          {isEvaluating && <LoadingSpinner text="Our AI examiner is evaluating your speaking..." />}
        </AnimatedCard>
      )}

      {evaluation && (
        <div className="space-y-6">
          {pronunciationFromAudio && (
            <AnimatedCard className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Pronunciation was assessed from your actual Part 2 recording.
              </p>
            </AnimatedCard>
          )}
          <EvaluationDisplay result={evaluation} />
          <AnimatedCard className="text-center p-6" delay={600}>
            <button
              onClick={startNewTest}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:from-slate-700 hover:to-slate-800 transform hover:scale-105 transition-all duration-200"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Try Another Test
            </button>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default SpeakingSection;
