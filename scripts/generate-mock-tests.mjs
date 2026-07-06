#!/usr/bin/env node
/**
 * Generates full IELTS Academic mock tests into src/data/mockTests/.
 *
 * Each test has a distinct theme (no repeated Writing/Speaking themes) and the
 * exact shape the app expects (see src/types MockTest). Sections are generated
 * in separate calls for reliability, then assembled and validated before the
 * file is written. Existing test files are skipped unless --force is passed.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-mock-tests.mjs           # tests 2-10
 *   GEMINI_API_KEY=... node scripts/generate-mock-tests.mjs 2 5       # tests 2-5
 *   GEMINI_API_KEY=... node scripts/generate-mock-tests.mjs 4 4 --force
 */
import { GoogleGenAI, Type } from '@google/genai';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'mockTests');
const MODEL = 'gemini-2.5-flash';

// Distinct theme per test. Test 1 (city life) is hand-authored and not regenerated.
const THEMES = {
  1: 'City life and urban environments',
  2: 'Health, medicine and well-being',
  3: 'Work and the future of employment',
  4: 'The natural world and conservation',
  5: 'Education and lifelong learning',
  6: 'Science, space and discovery',
  7: 'Food, agriculture and diet',
  8: 'Travel, tourism and cultural heritage',
  9: 'Media, communication and technology',
  10: 'Money, business and consumer behaviour',
};

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/app/apikey');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// --- Response schemas -------------------------------------------------------

const listeningQuestion = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    question: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['multiple_choice', 'short_answer', 'sentence_completion'] },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true, description: 'Required for multiple_choice only.' },
    answer: { type: Type.STRING, description: 'Must be findable in the transcript. For multiple_choice, must exactly match one option. For short/sentence answers, 1-3 words.' },
    explanation: { type: Type.STRING, description: 'Quote the moment in the transcript that gives the answer.' },
    category: { type: Type.STRING, enum: ['number', 'date_time', 'name_spelling', 'place_direction', 'detail', 'main_idea'] },
  },
  required: ['id', 'question', 'type', 'answer', 'explanation', 'category'],
};

const readingQuestion = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    question: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['multiple_choice', 'short_answer', 'true_false_not_given', 'matching_headings'] },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true, description: 'Required for multiple_choice and matching_headings. Omit for the others.' },
    answer: { type: Type.STRING, description: "For true_false_not_given must be exactly 'True', 'False', or 'Not Given'. For multiple_choice/matching_headings must exactly match one option." },
    explanation: { type: Type.STRING, description: 'Reference the specific sentence(s) in the passage that support the answer.' },
  },
  required: ['id', 'question', 'type', 'answer', 'explanation'],
};

const listeningPart = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    scenario: { type: Type.STRING },
    transcript: { type: Type.STRING, description: 'Natural spoken transcript, 400-600 words, containing every fact the questions test.' },
    questions: { type: Type.ARRAY, items: listeningQuestion },
  },
  required: ['title', 'scenario', 'transcript', 'questions'],
};

const readingPassage = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING, description: '700-800 word academic passage.' },
    questions: { type: Type.ARRAY, items: readingQuestion },
  },
  required: ['title', 'passage', 'questions'],
};

const listeningSchema = { type: Type.OBJECT, properties: { parts: { type: Type.ARRAY, items: listeningPart } }, required: ['parts'] };
const readingSchema = { type: Type.OBJECT, properties: { passages: { type: Type.ARRAY, items: readingPassage } }, required: ['passages'] };

const writingSchema = {
  type: Type.OBJECT,
  properties: {
    task1: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING },
        chartData: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['bar', 'line', 'pie'] },
            title: { type: Type.STRING },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            datasets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { label: { type: Type.STRING }, data: { type: Type.ARRAY, items: { type: Type.NUMBER } } },
                required: ['label', 'data'],
              },
            },
          },
          required: ['type', 'title', 'labels', 'datasets'],
        },
      },
      required: ['prompt', 'chartData'],
    },
    task2: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ['prompt'] },
  },
  required: ['task1', 'task2'],
};

const speakingSchema = {
  type: Type.OBJECT,
  properties: {
    part1: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['topic', 'questions'] },
    part2: { type: Type.OBJECT, properties: { cueCard: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['cueCard', 'points'] },
    part3: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['topic', 'questions'] },
  },
  required: ['part1', 'part2', 'part3'],
};

// --- Generation -------------------------------------------------------------

async function generate(schema, prompt) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema },
  });
  return JSON.parse(res.text);
}

async function generateListening(theme, n) {
  const data = await generate(
    listeningSchema,
    `Generate a complete IELTS Academic Listening test on the broad theme of "${theme}".
Produce EXACTLY 4 parts. Each part has EXACTLY 10 questions, so 40 in total.
- Part 1: an everyday social conversation (two speakers).
- Part 2: a monologue on a non-academic topic (e.g. a talk, tour, or announcement).
- Part 3: an academic discussion between 2-3 speakers (e.g. students and a tutor).
- Part 4: an academic lecture (monologue).
Each transcript must be natural spoken English of 400-600 words containing every fact the questions test (numbers, dates, spelled-out names, places, directions spoken aloud). Mix multiple_choice, short_answer and sentence_completion. Vary the six skill categories across questions.
Question IDs must be unique across all parts, formatted "L{part}-{n}" (e.g. L1-1 ... L4-10).`
  );
  return data;
}

async function generateReading(theme, n) {
  const data = await generate(
    readingSchema,
    `Generate a complete IELTS Academic Reading test on the broad theme of "${theme}".
Produce EXACTLY 3 passages of 700-800 words each, of increasing difficulty, with 13, 13 and 14 questions respectively (40 total).
- At least one passage must include a set of true_false_not_given questions (answers exactly 'True', 'False', or 'Not Given').
- At least one passage must include a set of matching_headings questions (each with an options list of candidate headings).
- Also use multiple_choice (4 options) and short_answer (1-3 words).
Every question needs an explanation referencing the specific supporting sentence(s).
Question IDs must be unique across all passages, formatted "R{passage}-{n}" (e.g. R1-1 ... R3-14).`
  );
  return data;
}

async function generateWriting(theme, n) {
  return generate(
    writingSchema,
    `Generate IELTS Academic Writing tasks on the theme of "${theme}".
Task 1: a data-description task with realistic chartData (bar, line, or pie). The prompt must follow the standard IELTS Task 1 wording and end with "Write at least 150 words." The chartData must have coherent labels and numeric datasets that genuinely support comparison.
Task 2: an essay prompt in a standard IELTS format (opinion / discussion / problem-solution / advantages-disadvantages), ending with "Write at least 250 words."
The Task 1 and Task 2 topics must both relate to "${theme}" and must be distinct from generic city/transport themes.`
  );
}

async function generateSpeaking(theme, n) {
  return generate(
    speakingSchema,
    `Generate a full IELTS Academic Speaking test themed around "${theme}".
Part 1: a familiar personal topic with 5 questions.
Part 2: a cue card ("Describe a...") with 4 bullet points; make the FIRST point the note "Preparation note: you have one minute to make notes before speaking for up to two minutes."
Part 3: a discussion topic clearly tied to the Part 2 topic, with 5 abstract questions.
All content must relate to "${theme}".`
  );
}

// --- Validation -------------------------------------------------------------

function validate(test) {
  const errs = [];
  const L = test.listening.parts;
  if (L.length !== 4) errs.push(`listening has ${L.length} parts, expected 4`);
  const lq = L.flatMap((p) => p.questions);
  if (lq.length !== 40) errs.push(`listening has ${lq.length} questions, expected 40`);

  const R = test.reading.passages;
  if (R.length !== 3) errs.push(`reading has ${R.length} passages, expected 3`);
  const rq = R.flatMap((p) => p.questions);
  if (rq.length !== 40) errs.push(`reading has ${rq.length} questions, expected 40`);

  const ids = [...lq.map((q) => q.id), ...rq.map((q) => q.id)];
  if (new Set(ids).size !== ids.length) errs.push('duplicate question ids');

  for (const q of [...lq, ...rq]) {
    if (!q.answer || !q.answer.trim()) errs.push(`${q.id} missing answer`);
    if ((q.type === 'multiple_choice' || q.type === 'matching_headings')) {
      if (!Array.isArray(q.options) || q.options.length < 2) errs.push(`${q.id} needs options`);
      else if (!q.options.includes(q.answer)) errs.push(`${q.id} answer not in options`);
    }
    if (q.type === 'true_false_not_given' && !['True', 'False', 'Not Given'].includes(q.answer)) {
      errs.push(`${q.id} TFNG answer must be True/False/Not Given, got "${q.answer}"`);
    }
  }
  if (!test.reading.passages.some((p) => p.questions.some((q) => q.type === 'true_false_not_given')))
    errs.push('no true_false_not_given set in reading');
  if (!test.reading.passages.some((p) => p.questions.some((q) => q.type === 'matching_headings')))
    errs.push('no matching_headings set in reading');

  return errs;
}

// --- Main -------------------------------------------------------------------

async function buildTest(n) {
  const theme = THEMES[n];
  const id = `test-${String(n).padStart(2, '0')}`;
  console.log(`\n[${id}] theme: ${theme}`);
  const [listening, reading, writing, speaking] = await Promise.all([
    generateListening(theme, n),
    generateReading(theme, n),
    generateWriting(theme, n),
    generateSpeaking(theme, n),
  ]);
  const test = { id, title: `Academic Mock Test ${n}`, theme, listening, reading, writing, speaking };
  const errs = validate(test);
  if (errs.length) {
    console.error(`[${id}] validation failed:\n  - ${errs.join('\n  - ')}`);
    return null;
  }
  return test;
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const force = process.argv.includes('--force');
  const from = args[0] ? parseInt(args[0], 10) : 2;
  const to = args[1] ? parseInt(args[1], 10) : 10;

  for (let n = from; n <= to; n++) {
    if (!THEMES[n]) { console.warn(`No theme defined for test ${n}, skipping.`); continue; }
    const file = join(OUT_DIR, `test-${String(n).padStart(2, '0')}.json`);
    if (existsSync(file) && !force) { console.log(`test-${String(n).padStart(2, '0')}.json exists, skipping (use --force to overwrite).`); continue; }

    let test = null;
    for (let attempt = 1; attempt <= 2 && !test; attempt++) {
      try {
        test = await buildTest(n);
      } catch (err) {
        console.error(`[test-${n}] attempt ${attempt} error:`, err.message);
      }
    }
    if (test) {
      writeFileSync(file, JSON.stringify(test, null, 2) + '\n');
      console.log(`✓ wrote ${file}`);
    } else {
      console.error(`✗ gave up on test ${n} after 2 attempts`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
