import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' });
    }

    const {
      evaluationType,
      content,
      answers,
      task1Prompt,
      task1Answer,
      task2Prompt,
      task2Answer,
    } = req.body;

    if (!evaluationType || !["writing", "speaking", "pronunciation"].includes(evaluationType)) {
      return res.status(400).json({ error: "Invalid evaluation type" });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
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

Provide honest, detailed feedback that helps improvement.

Additionally:
- Select the 5-8 weakest sentences from the candidate's answers. For each, quote the original sentence exactly, rewrite it as a band 8+ writer would, and explain in one or two sentences WHY the change improves it (name the grammar rule, collocation, or cohesion principle involved). Categorize each as grammar, vocabulary, style, or coherence.
- Write complete model answers for both tasks at band 8.5-9 level: Task 1 around 170-190 words responding to the actual chart/prompt given, Task 2 around 270-300 words responding to the actual essay question given. These are for the student to compare against their own writing.`;

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
              sentenceSuggestions: {
                type: Type.ARRAY,
                description:
                  "5-8 sentence-level corrections taken from the candidate's actual writing",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: {
                      type: Type.STRING,
                      description: "The candidate's exact original sentence",
                    },
                    improved: {
                      type: Type.STRING,
                      description: "The sentence rewritten at band 8+ level",
                    },
                    explanation: {
                      type: Type.STRING,
                      description:
                        "Why the change improves the sentence (grammar rule, collocation, cohesion principle)",
                    },
                    category: {
                      type: Type.STRING,
                      enum: ["grammar", "vocabulary", "style", "coherence"],
                    },
                  },
                  required: ["original", "improved", "explanation", "category"],
                },
              },
              modelAnswers: {
                type: Type.OBJECT,
                properties: {
                  task1: {
                    type: Type.STRING,
                    description: "Band 8.5-9 model answer for Task 1 (170-190 words)",
                  },
                  task2: {
                    type: Type.STRING,
                    description: "Band 8.5-9 model answer for Task 2 (270-300 words)",
                  },
                },
                required: ["task1", "task2"],
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
              "sentenceSuggestions",
              "modelAnswers",
            ],
          },
        },
      });

      result = JSON.parse(response.text);
    } else if (evaluationType === "speaking") {
      const { metrics } = req.body;

      if (!content || !answers) {
        return res
          .status(400)
          .json({ error: "Missing content or answers for speaking evaluation" });
      }

      const criterionProps = {
        band: { type: Type.NUMBER, description: "Band score 1-9" },
        feedback: { type: Type.STRING, description: "Detailed, specific feedback" },
      };

      const prompt = `
You are a strict IELTS Speaking examiner with 15+ years of experience. Evaluate this candidate's Speaking test using the official IELTS Speaking band descriptors. Be rigorous and realistic - most candidates score between 5.0-7.0.

The candidate's spoken responses were captured with speech-to-text, so ignore missing punctuation/capitalization, but DO treat the transcripts as faithful records of the words spoken.

**TEST QUESTIONS (all three parts):**
${JSON.stringify(content)}

**CANDIDATE'S TRANSCRIBED RESPONSES:**
${JSON.stringify(answers)}

**DELIVERY METRICS (measured from the recordings):**
${JSON.stringify(metrics || {})}
For reference: natural English conversation runs roughly 130-170 words per minute. Well below that suggests hesitation; far above may indicate rushed, unclear speech. Note that speech-to-text often filters out "um"/"uh", so the true filler count is likely higher than measured.

Evaluate each criterion strictly:
- **Fluency and Coherence**: response length and development, use of the metrics above, discourse markers, topic development, whether Part 2 was sustained as a long turn.
- **Lexical Resource**: range, idiomatic language, paraphrase ability, precision of word choice.
- **Grammatical Range and Accuracy**: sentence variety, error frequency and types (visible in the transcript).
- **Pronunciation**: you cannot hear the audio, so give a provisional estimate from what the transcript suggests (word choice complexity, any transcription artifacts) and state clearly in the feedback that this is an estimate not based on audio.

Also provide:
- 4-6 corrections quoting the candidate's exact words, with the improved version and why it's better.
- A short analysis of their speaking pace and filler-word usage based on the metrics.
- Honest strengths and specific, actionable areas for improvement.`;

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fluencyAndCoherence: { type: Type.OBJECT, properties: criterionProps, required: ["band", "feedback"] },
              lexicalResource: { type: Type.OBJECT, properties: criterionProps, required: ["band", "feedback"] },
              grammaticalRangeAndAccuracy: { type: Type.OBJECT, properties: criterionProps, required: ["band", "feedback"] },
              pronunciation: { type: Type.OBJECT, properties: criterionProps, required: ["band", "feedback"] },
              overallBandScore: { type: Type.NUMBER, description: "Overall band 1-9, average of the four criteria rounded to nearest 0.5" },
              strengths: { type: Type.STRING },
              areasForImprovement: { type: Type.STRING },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING, description: "The candidate's exact words" },
                    improved: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["grammar", "vocabulary", "style", "coherence"] },
                  },
                  required: ["original", "improved", "explanation", "category"],
                },
              },
              paceAnalysis: { type: Type.STRING, description: "Analysis of speaking pace and filler words based on the metrics" },
            },
            required: [
              "fluencyAndCoherence",
              "lexicalResource",
              "grammaticalRangeAndAccuracy",
              "pronunciation",
              "overallBandScore",
              "strengths",
              "areasForImprovement",
              "corrections",
              "paceAnalysis",
            ],
          },
        },
      });

      result = JSON.parse(response.text);
    } else if (evaluationType === "pronunciation") {
      const { audio, mimeType, cueCard } = req.body;

      if (!audio || !mimeType) {
        return res.status(400).json({ error: "Missing audio for pronunciation analysis" });
      }
      // Inline base64 payload cap; Vercel rejects bodies over ~4.5MB anyway.
      if (typeof audio !== "string" || audio.length > 4_000_000) {
        return res.status(400).json({ error: "Audio recording too large to analyze" });
      }

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: audio } },
              {
                text: `This is a recording of an IELTS Speaking Part 2 long turn${cueCard ? ` on the topic: "${cueCard}"` : ""}. You are an IELTS examiner assessing PRONUNCIATION only, per the official band descriptors: individual sounds, word stress, sentence stress, intonation, chunking, and overall intelligibility. Give a band score 1-9, detailed feedback, and 2-5 specific examples of words or phrases from the recording that were mispronounced, unclear, or well delivered (quote them).`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              band: { type: Type.NUMBER, description: "Pronunciation band score 1-9" },
              feedback: { type: Type.STRING },
              examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["band", "feedback", "examples"],
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
