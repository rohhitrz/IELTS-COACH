import {
  ListeningContent,
  ReadingContent,
  SpeakingContent,
  WritingContent,
  WritingEvaluation,
  SpeakingEvaluation,
  SpeakingMetrics,
  PronunciationFeedback,
} from "../types";

// Import mock service for local development
import * as mockService from "./mockService";

const API_BASE_URL = "";
const USE_MOCK_DATA = import.meta.env.DEV; // Use mock data in development mode

async function apiCall<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function generateListeningTest(): Promise<ListeningContent> {
  if (USE_MOCK_DATA) {
    return mockService.generateListeningTest();
  }
  return apiCall<ListeningContent>("generate", { testType: "listening" });
}

export async function generateReadingTest(): Promise<ReadingContent> {
  if (USE_MOCK_DATA) {
    return mockService.generateReadingTest();
  }
  return apiCall<ReadingContent>("generate", { testType: "reading" });
}

export async function generateWritingTest(): Promise<WritingContent> {
  if (USE_MOCK_DATA) {
    return mockService.generateWritingTest();
  }
  return apiCall<WritingContent>("generate", { testType: "writing" });
}

export async function generateSpeakingTest(): Promise<SpeakingContent> {
  if (USE_MOCK_DATA) {
    return mockService.generateSpeakingTest();
  }
  return apiCall<SpeakingContent>("generate", { testType: "speaking" });
}

export async function evaluateWriting(
  task1Prompt: string,
  task1Answer: string,
  task2Prompt: string,
  task2Answer: string
): Promise<WritingEvaluation> {
  if (USE_MOCK_DATA) {
    return mockService.evaluateWriting();
  }
  return apiCall<WritingEvaluation>("evaluate", {
    evaluationType: "writing",
    task1Prompt,
    task1Answer,
    task2Prompt,
    task2Answer,
  });
}

export async function evaluateSpeaking(
  content: SpeakingContent,
  answers: any,
  metrics: SpeakingMetrics
): Promise<SpeakingEvaluation> {
  if (USE_MOCK_DATA) {
    return mockService.evaluateSpeaking();
  }
  return apiCall<SpeakingEvaluation>("evaluate", {
    evaluationType: "speaking",
    content,
    answers,
    metrics,
  });
}

export async function evaluatePronunciation(
  audioBase64: string,
  mimeType: string,
  cueCard?: string
): Promise<PronunciationFeedback> {
  if (USE_MOCK_DATA) {
    return mockService.evaluatePronunciation();
  }
  return apiCall<PronunciationFeedback>("evaluate", {
    evaluationType: "pronunciation",
    audio: audioBase64,
    mimeType,
    cueCard,
  });
}
