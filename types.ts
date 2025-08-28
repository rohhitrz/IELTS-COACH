
export enum ExamSection {
  WELCOME = 'WELCOME',
  LISTENING = 'LISTENING',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false_not_given';
  options?: string[];
  answer?: string;
}

export interface ListeningContent {
  scenario: string;
  transcript: string;
  questions: Question[];
}

export interface ReadingContent {
  title: string;
  passage: string;
  questions: Question[];
}

export interface WritingContent {
  task1: {
    prompt: string;
    imageUrl: string;
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

export interface WritingEvaluation {
    taskResponse: EvaluationCriterion;
    coherenceAndCohesion: EvaluationCriterion;
    lexicalResource: EvaluationCriterion;
    grammaticalRangeAndAccuracy: EvaluationCriterion;
    overallBandScore: number;
    strengths: string;
    areasForImprovement: string;
}

export interface GeneralEvaluation {
    estimatedBand: number;
    feedback: string;
    strengths: string;
    areasForImprovement: string;
}

export type EvaluationResult = WritingEvaluation | GeneralEvaluation;
