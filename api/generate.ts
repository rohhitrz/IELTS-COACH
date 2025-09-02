import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('API Key exists:', !!apiKey);
        console.log('Request body:', req.body);
        
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' });
        }

        const { testType } = req.body;

        if (!testType || !['listening', 'reading', 'writing', 'speaking'].includes(testType)) {
            return res.status(400).json({ error: 'Invalid test type' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        let response;
        let content;

        switch (testType) {
            case 'listening':
                response = await ai.models.generateContent({
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
                content = JSON.parse(response.text);
                break;

            case 'reading':
                response = await ai.models.generateContent({
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
                content = JSON.parse(response.text);
                break;

            case 'writing':
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `Generate authentic IELTS Academic Writing tasks:

TASK 1: Create a realistic data visualization task (bar chart, line graph, pie chart, table, or process diagram). The prompt should:
- Follow the exact IELTS format: "The [chart type] below shows [description]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words."
- Include realistic data that could appear in actual IELTS exams (demographics, economics, environment, education, etc.)
- Provide clear, meaningful data that allows for proper analysis and comparison
- Use appropriate time periods, countries, or categories that make sense

TASK 2: Create an authentic IELTS essay prompt that:
- Follows standard IELTS Task 2 formats (opinion, discussion, problem-solution, or advantages-disadvantages)
- Addresses contemporary issues (technology, environment, education, society, work, etc.)
- Includes the standard instruction: "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words."
- Is at appropriate academic level for IELTS candidates

Make the data realistic and the topics current and relevant.`,
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
                
                content = JSON.parse(response.text);
                
                // Generate a professional chart image from the data
                const chartConfig = content.task1.chartData;
                const chartJsConfig = {
                    type: chartConfig.type,
                    data: {
                        labels: chartConfig.labels,
                        datasets: chartConfig.datasets.map((dataset, index) => ({
                            ...dataset,
                            backgroundColor: chartConfig.type === 'pie' 
                                ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                                : index === 0 ? '#36A2EB' : '#FF6384',
                            borderColor: chartConfig.type === 'line' 
                                ? (index === 0 ? '#36A2EB' : '#FF6384')
                                : undefined,
                            borderWidth: chartConfig.type === 'line' ? 2 : 1,
                            fill: chartConfig.type === 'line' ? false : undefined,
                            tension: chartConfig.type === 'line' ? 0.1 : undefined
                        }))
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: chartConfig.title,
                                font: { 
                                    size: 16,
                                    weight: 'bold'
                                },
                                padding: 20
                            },
                            legend: {
                                display: chartConfig.datasets.length > 1,
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: { size: 12 }
                                }
                            }
                        },
                        scales: chartConfig.type !== 'pie' ? {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: chartConfig.type === 'bar' && chartConfig.title.includes('electricity') 
                                        ? 'Billion kWh' 
                                        : chartConfig.title.includes('percentage') || chartConfig.title.includes('%')
                                        ? 'Percentage (%)'
                                        : 'Value',
                                    font: { size: 12 }
                                },
                                grid: {
                                    color: '#e5e7eb'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: chartConfig.type === 'bar' ? 'Categories' : 'Time Period',
                                    font: { size: 12 }
                                },
                                grid: {
                                    display: false
                                }
                            }
                        } : undefined,
                        layout: {
                            padding: 20
                        }
                    }
                };

                const stringifiedConfig = JSON.stringify(chartJsConfig);
                const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(stringifiedConfig)}&width=700&height=450&backgroundColor=white`;
                content.task1.imageUrl = chartUrl;
                break;

            case 'speaking':
                response = await ai.models.generateContent({
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
                content = JSON.parse(response.text);
                break;

            default:
                return res.status(400).json({ error: 'Invalid test type' });
        }

        res.status(200).json(content);
    } catch (error) {
        console.error('Error generating test:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate test',
            details: error.message,
            hasApiKey: !!apiKey
        });
    }
}