
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
        type: { type: Type.STRING, enum: ['multiple_choice', 'short_answer', 'true_false_not_given', 'matching_headings'] },
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
        contents: "Generate a complete IELTS Academic Reading test with 3 passages and a total of 40 questions. The passages should be on distinct academic topics, each approximately 700-800 words. Distribute the 40 questions across the three passages (e.g., 13, 13, 14 questions). The question types should be varied (e.g., multiple choice, true/false/not given, short answer, matching headings). Provide correct answers for all questions. Ensure question IDs are unique across all passages.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                   passages: {
                       type: Type.ARRAY,
                       items: {
                           type: Type.OBJECT,
                           properties: {
                               title: { type: Type.STRING },
                               passage: { type: Type.STRING },
                               questions: { type: Type.ARRAY, items: questionSchema }
                           },
                           required: ['title', 'passage', 'questions']
                       }
                   }
                },
                required: ['passages']
            }
        }
    });

    return JSON.parse(response.text);
}

export async function generateWritingTest(): Promise<WritingContent> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate prompts for IELTS Academic Writing Task 1 and Task 2. For Task 1, provide a prompt describing a chart or graph, and also provide the underlying data for it as a JSON object. The data should include a chart type (bar, line, or pie), a title, labels for the x-axis, and one or more datasets each with a label and data points. The chart should be simple enough to be described in an IELTS Task 1 response. Task 2 should be an essay prompt on an academic topic.",
        config: {
            responseMimeType: "application/json",
            responseSchema: {
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
                                            properties: {
                                                label: { type: Type.STRING },
                                                data: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                                            },
                                            required: ['label', 'data']
                                        }
                                    }
                                },
                                required: ['type', 'title', 'labels', 'datasets']
                            }
                        },
                        required: ['prompt', 'chartData']
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
    
    const content = JSON.parse(response.text) as WritingContent;
    
    // Generate a real chart image from the data
    const chartConfig = content.task1.chartData;
    const chartJsConfig = {
        type: chartConfig.type,
        data: {
            labels: chartConfig.labels,
            datasets: chartConfig.datasets
        },
        options: {
            title: {
                display: true,
                text: chartConfig.title
            },
            legend: {
                display: chartConfig.datasets.length > 1
            }
        }
    };

    const stringifiedConfig = JSON.stringify(chartJsConfig);
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(stringifiedConfig)}&width=600&height=400&backgroundColor=white`;
    content.task1.imageUrl = chartUrl;

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
