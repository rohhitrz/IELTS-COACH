# IELTS Academic AI Coach

An AI-powered IELTS Academic test preparation application built with React and TypeScript.

## Features

- **Listening Section**: Practice with AI-generated listening scenarios and questions
- **Reading Section**: Work through academic passages with various question types
- **Writing Section**: Complete Task 1 (chart description) and Task 2 (essay) with AI evaluation
- **Speaking Section**: Practice all three parts with speech-to-text functionality
- **AI Evaluation**: Get detailed feedback and band scores for your performance
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Setup

**Prerequisites:** Node.js

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server: `npm run dev`

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Web Speech API

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── BaseSection.tsx
│   │   ├── EvaluationDisplay.tsx
│   │   ├── IconComponents.tsx
│   │   ├── ListeningSection.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ReadingSection.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SpeakingSection.tsx
│   │   ├── Timer.tsx
│   │   ├── WelcomeScreen.tsx
│   │   └── WritingSection.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useSpeechToText.tsx
│   ├── services/           # API services
│   │   └── geminiService.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment types
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## AI Studio

