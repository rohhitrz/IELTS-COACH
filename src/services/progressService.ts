import { Attempt, EvaluationResult, MockTestResults, MockSectionKey } from '../types';

const ATTEMPTS_KEY = 'ielts-attempts-v1';
const DRAFT_KEY_PREFIX = 'ielts-draft-v1-';
const MOCK_RESULTS_KEY = 'ielts-mock-results-v1';
const MAX_ATTEMPTS = 50;

function readAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as Attempt[]) : [];
  } catch {
    return [];
  }
}

function writeAttempts(attempts: Attempt[]) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, MAX_ATTEMPTS)));
  } catch {
    // Storage full or unavailable — history is a best-effort feature.
  }
}

export function getAttempts(): Attempt[] {
  return readAttempts();
}

export function bandOf(result: EvaluationResult): number {
  if ('overallBandScore' in result) return result.overallBandScore;
  if ('estimatedBand' in result) return result.estimatedBand;
  return 0;
}

export function saveAttempt(section: Attempt['section'], result: EvaluationResult): Attempt {
  const attempt: Attempt = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    timestamp: Date.now(),
    band: bandOf(result),
    result,
  };
  writeAttempts([attempt, ...readAttempts()]);
  return attempt;
}

export function deleteAttempt(id: string) {
  writeAttempts(readAttempts().filter((a) => a.id !== id));
}

function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days (ending today or yesterday) with at least one completed session. */
export function getStreak(attempts: Attempt[]): number {
  const days = new Set(attempts.map((a) => dayKey(a.timestamp)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  // A streak is still alive if the last practice was yesterday.
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor.getTime()))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function practicedToday(attempts: Attempt[]): boolean {
  return attempts.some((a) => dayKey(a.timestamp) === dayKey(Date.now()));
}

// --- Mock test results (per test id, per section) ---

function readMockResults(): Record<string, MockTestResults> {
  try {
    const raw = localStorage.getItem(MOCK_RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getMockResults(): Record<string, MockTestResults> {
  return readMockResults();
}

export function saveMockSectionResult(testId: string, section: MockSectionKey, band: number) {
  try {
    const all = readMockResults();
    all[testId] = { ...all[testId], [section]: { band, timestamp: Date.now() } };
    localStorage.setItem(MOCK_RESULTS_KEY, JSON.stringify(all));
  } catch {
    // best effort
  }
}

/**
 * Overall band from the four section bands using the official IELTS rule:
 * the mean rounded to the nearest half, with .25 and .75 rounded UP
 * (Math.round on doubled values gives exactly that behaviour).
 */
export function overallBand(bands: number[]): number {
  if (bands.length === 0) return 0;
  const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.round(mean * 2) / 2;
}

// --- In-progress test drafts (autosave/restore, e.g. writing essays) ---

export interface Draft<C, A> {
  content: C;
  answers: A;
  startedAt: number;
}

export function saveDraft<C, A>(section: string, content: C, answers: A, startedAt: number) {
  try {
    localStorage.setItem(
      DRAFT_KEY_PREFIX + section,
      JSON.stringify({ content, answers, startedAt } satisfies Draft<C, A>)
    );
  } catch {
    // Best effort — reading tests can be large; never crash the app over autosave.
  }
}

export function loadDraft<C, A>(section: string): Draft<C, A> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + section);
    return raw ? (JSON.parse(raw) as Draft<C, A>) : null;
  } catch {
    return null;
  }
}

export function clearDraft(section: string) {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + section);
  } catch {
    // ignore
  }
}
