# IELTS Academic AI Coach

An AI-powered IELTS Academic test preparation app. It generates practice tests and evaluates responses using Google's Gemini API, with all AI calls made server-side through Vercel serverless functions so the API key is never exposed to the browser.

## Status

| Section | Status |
|---|---|
| Writing | Fully implemented — Task 1 + Task 2, AI-generated prompts/charts, AI band-score evaluation |
| Reading | Fully implemented — AI-generated passages and questions, AI evaluation |
| Listening | Not implemented — shows "Coming Soon" |
| Speaking | Not implemented — shows "Coming Soon" |

See [`FUTURE_WORK.md`](FUTURE_WORK.md) (untracked, local reference only) for what's left before those two sections and the rest of the production hardening are done.

## Features

- **Writing Section**: Task 1 (chart description) and Task 2 (essay), with AI-generated prompts and detailed band-score feedback across all four IELTS writing criteria
- **Reading Section**: AI-generated academic passages with multiple question types (multiple choice, true/false/not given, short answer, matching headings)
- **AI Evaluation**: Band scores and actionable feedback powered by Gemini
- **Dark mode** and **responsive design**
- **Mock mode in development** — `npm run dev` uses local mock data instead of calling the Gemini API, so no API key is needed just to work on the UI

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4 (compiled at build time via `@tailwindcss/vite`, not the CDN build)
- Google Gemini API (`@google/genai`), called only from serverless functions
- Vercel serverless functions (`@vercel/node`)
- Web Speech API (used by the in-progress Speaking section)

## Project Structure

```
├── api/                     # Vercel serverless functions (server-side only)
│   ├── generate.ts          # Generates test content for a given section
│   └── evaluate.ts          # Evaluates submitted answers and returns band scores
├── src/
│   ├── components/          # React components
│   ├── hooks/                # Custom React hooks (e.g. useSpeechToText)
│   ├── services/
│   │   ├── apiService.ts    # Calls /api/* in production, mockService in dev
│   │   └── mockService.ts   # Local mock data used during `npm run dev`
│   ├── styles/               # Tailwind entry point + custom animations
│   ├── types/                # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── tsconfig.json
```

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
