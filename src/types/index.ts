export enum ExamSection {
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  LISTENING = 'LISTENING',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false_not_given' | 'matching_headings' | 'sentence_completion';

// Listening skill categories, used to surface recurring weaknesses (e.g. "you keep missing numbers")
export type ListeningCategory = 'number' | 'date_time' | 'name_spelling' | 'place_direction' | 'detail' | 'main_idea';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string;
  explanation?: string;
  category?: ListeningCategory;
}

export interface ListeningContent {
  scenario: string;
  transcript: string;
  questions: Question[];
}

export interface ReadingPassage {
    title: string;
    passage: string;
    questions: Question[];
}

export interface ReadingContent {
  passages: ReadingPassage[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface WritingContent {
  task1: {
    prompt: string;
    imageUrl: string;
    chartData: ChartData;
  };
  task2: {
    prompt: string;
  };
}

export interface SpeakingContent {
  part1: {
    topic: string;
    questions: string[];
  };
  part2: {
    cueCard: string;
    points: string[];
  };
  part3: {
    topic: string;
    questions: string[];
  };
}

export type ExamContent = ListeningContent | ReadingContent | WritingContent | SpeakingContent;

export interface EvaluationCriterion {
    band: number;
    feedback: string;
}

export interface SentenceSuggestion {
    original: string;
    improved: string;
    explanation: string;
    category: 'grammar' | 'vocabulary' | 'style' | 'coherence';
}

export interface WritingEvaluation {
    taskResponse: EvaluationCriterion;
    coherenceAndCohesion: EvaluationCriterion;
    lexicalResource: EvaluationCriterion;
    grammaticalRangeAndAccuracy: EvaluationCriterion;
    overallBandScore: number;
    strengths: string;
    areasForImprovement: string;
    wordCountAnalysis?: string;
    errorAnalysis?: string;
    sentenceSuggestions?: SentenceSuggestion[];
    modelAnswers?: {
        task1: string;
        task2: string;
    };
}

export interface GeneralEvaluation {
    estimatedBand: number;
    feedback: string;
    strengths: string;
    areasForImprovement: string;
}

// Deterministic result for Listening/Reading: scored locally against the answer key
export interface QuestionReview {
    id: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    group: string; // question type (reading) or skill category (listening)
}

export interface GroupBreakdown {
    group: string;
    correct: number;
    total: number;
}

export interface ObjectiveEvaluation {
    correctCount: number;
    totalCount: number;
    estimatedBand: number;
    review: QuestionReview[];
    breakdown: GroupBreakdown[];
}

export interface SpeakingMetrics {
    totalDurationSec: number;
    totalWords: number;
    wordsPerMinute: number;
    fillerWords: number;
}

export interface SpeakingEvaluation {
    fluencyAndCoherence: EvaluationCriterion;
    lexicalResource: EvaluationCriterion;
    grammaticalRangeAndAccuracy: EvaluationCriterion;
    pronunciation: EvaluationCriterion;
    overallBandScore: number;
    strengths: string;
    areasForImprovement: string;
    corrections?: SentenceSuggestion[];
    paceAnalysis?: string;
}

export interface PronunciationFeedback {
    band: number;
    feedback: string;
    examples: string[];
}

export type EvaluationResult = WritingEvaluation | GeneralEvaluation | ObjectiveEvaluation | SpeakingEvaluation;

// A completed practice session persisted to localStorage for the dashboard
export interface Attempt {
    id: string;
    section: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
    timestamp: number;
    band: number;
    result: EvaluationResult;
}