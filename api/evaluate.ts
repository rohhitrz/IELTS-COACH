import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const criterionSchema = {
  type: Type.OBJECT,
  properties: {
    band: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
  },
  required: ["band", "feedback"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      evaluationType,
      content,
      answers,
      task1Prompt,
      task1Answer,
      task2Prompt,
      task2Answer,
    } = req.body;

    if (!evaluationType || !["writing", "general"].includes(evaluationType)) {
      return res.status(400).json({ error: "Invalid evaluation type" });
    }

    let response;
    let result;

    if (evaluationType === "writing") {
      if (!task1Prompt || !task1Answer || !task2Prompt || !task2Answer) {
        return res
          .status(400)
          .json({ error: "Missing required writing evaluation parameters" });
      }

      const prompt = `
You are a strict IELTS examiner with 15+ years of experience. Evaluate these Writing responses using the official IELTS band descriptors. Be rigorous and realistic - most candidates score between 5.0-7.0.

**TASK 1 PROMPT:** ${task1Prompt}
**TASK 1 ANSWER:** ${task1Answer}

**TASK 2 PROMPT:** ${task2Prompt}  
**TASK 2 ANSWER:** ${task2Answer}

EVALUATION CRITERIA (evaluate each strictly):

**TASK ACHIEVEMENT/RESPONSE:**
Task 1: Check if candidate:
- Meets 150+ word minimum (deduct heavily if under 150)
- Addresses ALL parts of the task
- Presents clear overview of main trends/features
- Accurately describes data without speculation
- Makes appropriate comparisons
- Uses appropriate academic tone

Task 2: Check if candidate:
- Meets 250+ word minimum (deduct heavily if under 250)
- Fully addresses all parts of the question
- Presents clear position (if opinion required)
- Develops ideas sufficiently with examples
- Stays on topic throughout

**COHERENCE AND COHESION:**
- Logical organization and clear progression
- Effective paragraphing (intro, body, conclusion for Task 2)
- Appropriate linking words (not overused/underused)
- Clear referencing and substitution
- Overall clarity of message

**LEXICAL RESOURCE:**
- Range of vocabulary (simple = Band 5, sophisticated = Band 7+)
- Accuracy of word choice and collocation
- Spelling errors (count them - more than 5-6 = Band 6 max)
- Word formation errors
- Repetition vs. paraphrasing ability

**GRAMMATICAL RANGE AND ACCURACY:**
- Sentence structure variety (simple vs complex)
- Grammar accuracy (count errors - frequent errors = lower bands)
- Punctuation accuracy
- Tense consistency and appropriateness
- Subject-verb agreement, articles, prepositions

**BAND SCORE GUIDELINES:**
- Band 9: Expert user - rare errors, sophisticated language
- Band 8: Very good - occasional errors, wide range
- Band 7: Good - some errors, good range, clear communication
- Band 6: Competent - some errors don't impede communication
- Band 5: Modest - limited range, errors may cause strain
- Band 4: Limited - basic competence, frequent errors
- Band 3-1: Extremely limited to non-user

**IMPORTANT:** 
- Be harsh on grammar/spelling errors
- Check word count carefully
- Don't give high scores for basic responses
- Most responses should be Band 6.5-7 unless truly excellent
- If response is off-topic, irrelevant, or too short = Band 4 or below
- Consider if a native speaker would struggle to understand = lower band

Provide honest, detailed feedback that helps improvement.`;

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taskResponse: {
                type: Type.OBJECT,
                properties: {
                  band: {
                    type: Type.NUMBER,
                    description: "Band score 1-9 for Task Achievement/Response",
                  },
                  feedback: {
                    type: Type.STRING,
                    description:
                      "Detailed feedback covering both Task 1 and Task 2 requirements, word count issues, task fulfillment",
                  },
                },
                required: ["band", "feedback"],
              },
              coherenceAndCohesion: {
                type: Type.OBJECT,
                properties: {
                  band: {
                    type: Type.NUMBER,
                    description: "Band score 1-9 for Coherence and Cohesion",
                  },
                  feedback: {
                    type: Type.STRING,
                    description:
                      "Detailed feedback on organization, paragraphing, linking devices, logical flow",
                  },
                },
                required: ["band", "feedback"],
              },
              lexicalResource: {
                type: Type.OBJECT,
                properties: {
                  band: {
                    type: Type.NUMBER,
                    description: "Band score 1-9 for Lexical Resource",
                  },
                  feedback: {
                    type: Type.STRING,
                    description:
                      "Detailed feedback on vocabulary range, accuracy, spelling errors (count them), word choice, repetition",
                  },
                },
                required: ["band", "feedback"],
              },
              grammaticalRangeAndAccuracy: {
                type: Type.OBJECT,
                properties: {
                  band: {
                    type: Type.NUMBER,
                    description:
                      "Band score 1-9 for Grammatical Range and Accuracy",
                  },
                  feedback: {
                    type: Type.STRING,
                    description:
                      "Detailed feedback on sentence variety, grammar errors (count them), punctuation, tense usage",
                  },
                },
                required: ["band", "feedback"],
              },
              overallBandScore: {
                type: Type.NUMBER,
                description:
                  "Overall band score 1-9 (average of four criteria, be realistic - most responses are 5.0-6.5)",
              },
              strengths: {
                type: Type.STRING,
                description:
                  "Specific positive aspects of the writing (be honest, don't inflate)",
              },
              areasForImprovement: {
                type: Type.STRING,
                description:
                  "Specific, actionable advice for improvement with examples",
              },
              wordCountAnalysis: {
                type: Type.STRING,
                description:
                  "Analysis of word count for both tasks and impact on scoring",
              },
              errorAnalysis: {
                type: Type.STRING,
                description:
                  "Count and categorize major errors (grammar, spelling, vocabulary) and their impact",
              },
            },
            required: [
              "taskResponse",
              "coherenceAndCohesion",
              "lexicalResource",
              "grammaticalRangeAndAccuracy",
              "overallBandScore",
              "strengths",
              "areasForImprovement",
              "wordCountAnalysis",
              "errorAnalysis",
            ],
          },
        },
      });

      result = JSON.parse(response.text);
    } else if (evaluationType === "general") {
      const { section } = req.body;

      if (!section || !["Reading", "Listening", "Speaking"].includes(section)) {
        return res
          .status(400)
          .json({ error: "Invalid section for general evaluation" });
      }

      if (!content || !answers) {
        return res
          .status(400)
          .json({ error: "Missing content or answers for general evaluation" });
      }

      const prompt = `
              You are an expert IELTS examiner. Evaluate the following ${section} test answers.

              **Original Test Content:**
              ${JSON.stringify(content)}

              **Student's Answers:**
              ${JSON.stringify(answers)}

              Provide an estimated band score, overall feedback, key strengths, and areas for improvement. For Reading/Listening, compare user answers to the correct ones. For Speaking, evaluate the substance and quality of the text-based responses.
            `;

      response = await ai.models.generateContent({
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
              areasForImprovement: { type: Type.STRING },
            },
            required: [
              "estimatedBand",
              "feedback",
              "strengths",
              "areasForImprovement",
            ],
          },
        },
      });

      result = JSON.parse(response.text);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
}
