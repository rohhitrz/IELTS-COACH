# IELTS Academic AI Coach

An AI-powered IELTS Academic test preparation app. It generates practice tests and evaluates responses using Google's Gemini API, with all AI calls made server-side through Vercel serverless functions so the API key is never exposed to the browser.

## Features

All four IELTS skills are implemented, plus a progress dashboard:

- **Listening**: AI-generated test sections played as audio (text-to-speech) with exam-style once-through playback. The transcript stays hidden until you submit. Answers are scored deterministically against the answer key with per-question explanations that quote the transcript, and analytics show which listening skills you keep missing (numbers, dates, names, directions…).
- **Reading**: Three AI-generated academic passages with realistic question types (multiple choice, true/false/not given, short answer, matching headings). Select any word in a passage for an instant dictionary definition. Results include performance-by-question-type analytics and explanations referencing the passage.
- **Writing**: Task 1 (chart description) and Task 2 (essay) with band scores across the four official criteria, sentence-level corrections from your own writing with explanations, and band 8.5+ model answers for comparison. Drafts autosave — a refresh never loses your essay.
- **Speaking**: A full three-part test with a 1-minute preparation timer and 2-minute speaking limit for the Part 2 cue card, exactly like the exam. Answers are recorded (replayable) and transcribed live; you get band scores for all four speaking criteria, corrections from your actual words, and pace/filler-word analysis. When possible, pronunciation is assessed from your real Part 2 recording.
- **Dashboard**: Practice streak, daily goal, per-module band averages and trends, aggregated focus areas across your history, and full review of past sessions. All stored locally in your browser — nothing leaves your device except the AI evaluation calls.
- **Production UX**: deterministic Listening/Reading band conversion (no LLM guessing at objective scores), retry on AI failures, error boundaries, autosaved in-progress tests, dark mode, responsive layout.
- **Mock mode in development** — `npm run dev` uses local mock data instead of calling the Gemini API, so no API key is needed just to work on the UI.

See [`FUTURE_WORK.md`](FUTURE_WORK.md) (untracked, local reference only) for the remaining production-hardening backlog.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4 (compiled at build time via `@tailwindcss/vite`, not the CDN build)
- Google Gemini API (`@google/genai`), called only from serverless functions
- Vercel serverless functions (`@vercel/node`)
- Web Speech APIs: SpeechSynthesis for listening audio, SpeechRecognition + MediaRecorder for speaking practice
- localStorage for progress history, streaks, and draft autosave (no accounts/backend)

## Project Structure

```
├── api/                     # Vercel serverless functions (server-side only)
│   ├── generate.ts          # Generates test content for a given section
│   └── evaluate.ts          # Evaluates submitted answers and returns band scores
├── src/
│   ├── components/          # React components (sections, dashboard, shared UI)
│   ├── hooks/                # useSpeechSynthesis (TTS playback), useAudioRecorder (mic + transcription)
│   ├── services/
│   │   ├── apiService.ts    # Calls /api/* in production, mockService in dev
│   │   ├── mockService.ts   # Local mock data used during `npm run dev`
│   │   ├── scoringService.ts # Deterministic scoring + IELTS band conversion + analytics
│   │   └── progressService.ts # localStorage history, streaks, and draft autosave
│   ├── styles/               # Tailwind entry point + custom animations
│   ├── types/                # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vercel.json              # Serverless function timeouts
├── vite.config.ts
└── tsconfig.json
```

## How scoring works

- **Listening & Reading** are scored locally against the AI-generated answer key, then converted to an estimated band using the official IELTS raw-score conversion table. No AI call is made to grade objective answers — it's instant, free, and more accurate than asking a model to guess.
- **Writing & Speaking** are evaluated by Gemini against the official IELTS band descriptors, criterion by criterion, with the strict-examiner prompt asking for realistic (not inflated) scores.

## Setup

**Prerequisites:** Node.js 18+

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Get a key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
4. Start the development server: `npm run dev`

In dev mode the app uses mock data by default (see `USE_MOCK_DATA` in `src/services/apiService.ts`), so the app is usable without a key. The key is only required to exercise the real `/api/*` endpoints, which requires running behind a Vercel-compatible environment (e.g. `vercel dev`) rather than the plain Vite dev server.

## Scripts

- `npm run dev` — start the Vite dev server (mock data)
- `npm run build` — type-checked production build
- `npm run preview` — preview the production build locally
- `npm run test-api` — smoke-test the deployed `/api/generate` endpoint (edit the URL in `test-api.js` first)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Vercel deployment guide. In short:

1. Import the repository into Vercel
2. Set the `GEMINI_API_KEY` environment variable in the Vercel project settings
3. Deploy — Vercel builds the static frontend and the `/api/generate` and `/api/evaluate` serverless functions together

## Security Notes

- The Gemini API key lives only in the serverless function environment (`process.env.GEMINI_API_KEY`) and is never bundled into client-side code.
- `/api/*` endpoints have no authentication or rate limiting. This is acceptable for a low-traffic personal deployment, but anyone who discovers the endpoint URL can call it and consume your Gemini quota. If you deploy this publicly, add rate limiting before sharing the link widely (tracked in `FUTURE_WORK.md`).
