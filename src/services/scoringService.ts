import { Question, ObjectiveEvaluation, QuestionReview, GroupBreakdown } from '../types';

// Approximation of the official IELTS Academic raw-score-to-band conversion,
// expressed as fractions so it works for tests with fewer than 40 questions.
// (Official table: 30/40 = 7.0, 23/40 = 6.0, 15/40 = 5.0, etc.)
const BAND_CUTOFFS: [number, number][] = [
  [0.975, 9.0],
  [0.925, 8.5],
  [0.875, 8.0],
  [0.8, 7.5],
  [0.75, 7.0],
  [0.675, 6.5],
  [0.575, 6.0],
  [0.5, 5.5],
  [0.375, 5.0],
  [0.325, 4.5],
  [0.25, 4.0],
  [0.15, 3.5],
  [0.075, 3.0],
];

export function rawScoreToBand(correct: number, total: number): number {
  if (total === 0) return 0;
  const fraction = correct / total;
  for (const [cutoff, band] of BAND_CUTOFFS) {
    if (fraction >= cutoff) return band;
  }
  return 2.5;
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '');
}

const GROUP_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple choice',
  short_answer: 'Short answer',
  true_false_not_given: 'True / False / Not Given',
  matching_headings: 'Matching headings',
  sentence_completion: 'Sentence completion',
  number: 'Numbers & amounts',
  date_time: 'Dates & times',
  name_spelling: 'Names & spelling',
  place_direction: 'Places & directions',
  detail: 'Specific details',
  main_idea: 'Main ideas',
};

export function groupLabel(group: string): string {
  return GROUP_LABELS[group] || group;
}

/**
 * Scores answers against the generated answer key.
 * groupBy 'type' gives per-question-type analytics (Reading);
 * groupBy 'category' gives per-skill analytics (Listening).
 */
export function scoreObjectiveTest(
  questions: Question[],
  answers: { [key: string]: string },
  groupBy: 'type' | 'category'
): ObjectiveEvaluation {
  const review: QuestionReview[] = questions.map((q) => {
    const userAnswer = answers[q.id] || '';
    const correctAnswer = q.answer || '';
    const isCorrect =
      normalizeAnswer(userAnswer) !== '' &&
      normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
    return {
      id: q.id,
      question: q.question,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: q.explanation,
      group: (groupBy === 'category' ? q.category : q.type) || 'other',
    };
  });

  const breakdownMap = new Map<string, GroupBreakdown>();
  for (const r of review) {
    const entry = breakdownMap.get(r.group) || { group: r.group, correct: 0, total: 0 };
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
    breakdownMap.set(r.group, entry);
  }

  const correctCount = review.filter((r) => r.isCorrect).length;
  return {
    correctCount,
    totalCount: review.length,
    estimatedBand: rawScoreToBand(correctCount, review.length),
    review,
    breakdown: [...breakdownMap.values()].sort((a, b) => a.correct / a.total - b.correct / b.total),
  };
}

const FILLER_PATTERN = /\b(um+|uh+|erm*|hmm+|you know|i mean|sort of|kind of|basically|actually)\b/gi;

export function countFillerWords(text: string): number {
  return (text.match(FILLER_PATTERN) || []).length;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
