
import { GoogleGenAI, Type } from "@google/genai";
import { ListeningContent, ReadingContent, SpeakingContent, WritingContent, WritingEvaluation, GeneralEvaluation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        question: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['multiple_choice', 'short_answer', 'true_false_not_given'] },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
        answer: { type: Type.STRING, description: "The correct answer for the question." }
    },
    required: ['id', 'question', 'type', 'answer']
};

export async function generateListeningTest(): Promise<ListeningContent> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a complete IELTS Academic Listening test section. Include a scenario description, a full transcript, and 5-7 questions of various types (multiple choice, short answer). Provide correct answers for each question.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scenario: { type: Type.STRING, description: "A brief description of the listening context." },
                    transcript: { type: Type.STRING, description: "The full transcript of the audio." },
                    questions: { type: Type.ARRAY, items: questionSchema }
                },
                required: ['scenario', 'transcript', 'questions']
            }
        }
    });
    return JSON.parse(response.text);
}


export async function generateReadingTest(): Promise<ReadingContent> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a complete IELTS Academic Reading test passage and questions. The passage should be 700-800 words on an academic topic. Create 5-7 questions of various types (e.g., multiple choice, true/false/not given, short answer). Provide correct answers for each question.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    passage: { type: Type.STRING },
                    questions: { type: Type.ARRAY, items: questionSchema }
                },
                required: ['title', 'passage', 'questions']
            }
        }
    });

    return JSON.parse(response.text);
}

export async function generateWritingTest(): Promise<WritingContent> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate prompts for IELTS Academic Writing Task 1 and Task 2. Task 1 should describe a chart or graph. Task 2 should be an essay prompt on an academic topic.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    task1: {
                        type: Type.OBJECT,
                        properties: { prompt: { type: Type.STRING } },
                        required: ['prompt']
                    },
                    task2: {
                        type: Type.OBJECT,
                        properties: { prompt: { type: Type.STRING } },
                        required: ['prompt']
                    }
                },
                required: ['task1', 'task2']
            }
        }
    });
    
    const content = JSON.parse(response.text);
    // Add a placeholder image for the chart
    content.task1.imageUrl = `https://picsum.photos/seed/${Date.now()}/600/400`;
    return content;
}

export async function generateSpeakingTest(): Promise<SpeakingContent> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a full IELTS Academic Speaking test with questions for Part 1, a cue card for Part 2, and follow-up questions for Part 3. The topics should be common in IELTS.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    part1: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['topic', 'questions']
                    },
                    part2: {
                        type: Type.OBJECT,
                        properties: {
                            cueCard: { type: Type.STRING },
                            points: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['cueCard', 'points']
                    },
                    part3: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['topic', 'questions']
                    }
                },
                 required: ['part1', 'part2', 'part3']
            }
        }
    });

    return JSON.parse(response.text);
}

const criterionSchema = {
    type: Type.OBJECT,
    properties: {
        band: { type: Type.NUMBER },
        feedback: { type: Type.STRING }
    },
    required: ['band', 'feedback']
};

export async function evaluateWriting(task1Prompt: string, task1Answer: string, task2Prompt: string, task2Answer: string): Promise<WritingEvaluation> {
    const prompt = `
      You are an expert IELTS examiner. Evaluate the following Writing test answers.
      Provide a detailed evaluation based on the official IELTS assessment criteria.

      **Task 1 Prompt:** ${task1Prompt}
      **Task 1 Answer:** ${task1Answer}

      **Task 2 Prompt:** ${task2Prompt}
      **Task 2 Answer:** ${task2Answer}

      Provide separate feedback for Task 1 and Task 2 where appropriate within each criterion. Conclude with an overall band score for the entire writing section.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    taskResponse: criterionSchema,
                    coherenceAndCohesion: criterionSchema,
                    lexicalResource: criterionSchema,
                    grammaticalRangeAndAccuracy: criterionSchema,
                    overallBandScore: { type: Type.NUMBER, description: "A single overall band score from 1-9." },
                    strengths: { type: Type.STRING },
                    areasForImprovement: { type: Type.STRING }
                },
                required: ['taskResponse', 'coherenceAndCohesion', 'lexicalResource', 'grammaticalRangeAndAccuracy', 'overallBandScore', 'strengths', 'areasForImprovement']
            }
        }
    });

    return JSON.parse(response.text);
}

export async function evaluateGeneral(section: 'Reading' | 'Listening' | 'Speaking', originalContent: any, userAnswers: any): Promise<GeneralEvaluation> {
    const prompt = `
      You are an expert IELTS examiner. Evaluate the following ${section} test answers.

      **Original Test Content:**
      ${JSON.stringify(originalContent)}

      **Student's Answers:**
      ${JSON.stringify(userAnswers)}

      Provide an estimated band score, overall feedback, key strengths, and areas for improvement. For Reading/Listening, compare user answers to the correct ones. For Speaking, evaluate the substance and quality of the text-based responses.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    estimatedBand: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    strengths: { type: Type.STRING },
                    areasForImprovement: { type: Type.STRING }
                },
                required: ['estimatedBand', 'feedback', 'strengths', 'areasForImprovement']
            }
        }
    });

    return JSON.parse(response.text);
}
