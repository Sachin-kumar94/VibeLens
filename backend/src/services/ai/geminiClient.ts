/**
 * VibeLens Gemini AI Service Client
 * Connects to Google Generative AI for contextual interview follow-up questions,
 * answer structure evaluation, and tailored scenarios.
 */

import { GeminiProvider } from "./geminiProvider.js";
import { ModelRouter } from "./modelRouter.js";

export interface FollowUpRequest {
  mainQuestion: string;
  category: string;
  role: string;
  transcript: string;
  criteria?: string;
  followUpNumber?: number; // 1 or 2
}

export interface FollowUpResponse {
  question: string;
  whyThisQuestion: string;
  timeTargetMin: number;
  timeTargetMax: number;
  source: "gemini_ai" | "vibelens_engine";
}

export class GeminiClient {
  private apiKey: string | null = null;
  private model: string = "gemini-1.5-flash";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
  }

  /**
   * Generates a context-aware follow-up question tailored to the candidate's transcript
   */
  async generateFollowUp(params: FollowUpRequest): Promise<FollowUpResponse> {
    const { mainQuestion, category, role, transcript, criteria, followUpNumber = 1 } = params;

    // If candidate transcript is very short, generate an elaboration prompt
    const cleanTranscript = (transcript || "").trim();
    if (cleanTranscript.length < 25) {
      return {
        question: "Could you expand on that with a concrete project example or specific scenario you navigated?",
        whyThisQuestion: "Probes for concrete context when the initial answer was brief.",
        timeTargetMin: 45,
        timeTargetMax: 75,
        source: "vibelens_engine",
      };
    }

    if (GeminiProvider.isConfigured()) {
      try {
        const prompt = `You are an elite, thoughtful executive interviewer conducting an interview for a ${role} role in the "${category}" category.
Initial Question: "${mainQuestion}"
Key Evaluation Criteria: "${criteria || "Clear reasoning, concrete examples, trade-offs."}"
Candidate's Spoken Answer:
"""
${cleanTranscript.slice(0, 1500)}
"""

Task:
Generate a single, natural, incisive follow-up question (Follow-Up #${followUpNumber}) that digs deeper into an engineering trade-off, specific personal contribution, missing evidence, or impact mentioned or omitted in the answer.

Format your response strictly as valid JSON:
{
  "question": "The direct conversational follow-up question",
  "whyThisQuestion": "One concise sentence explaining what this follow-up evaluates",
  "timeTargetMin": 45,
  "timeTargetMax": 75
}`;

        const parsed = await GeminiProvider.generateStructured<any>(prompt, {
          feature: "interview_followup",
          model: ModelRouter.getFastModel(),
          timeoutMs: 10000,
        });

        if (parsed?.question && parsed.question.length > 10) {
          return {
            question: parsed.question,
            whyThisQuestion: parsed.whyThisQuestion || "Follow-up question probing technical reasoning and specific personal contribution.",
            timeTargetMin: parsed.timeTargetMin || 45,
            timeTargetMax: parsed.timeTargetMax || 75,
            source: "gemini_ai",
          };
        }
      } catch (err) {
        console.warn("[GeminiClient] Fallback to deterministic follow-up generation:", err);
      }
    }

    // High-quality deterministic fallback based on answer semantics & category
    return this.generateDeterministicFollowUp(mainQuestion, category, cleanTranscript, followUpNumber);
  }

  /**
   * Deterministic follow-up generator based on category rubrics and candidate content
   */
  private generateDeterministicFollowUp(
    mainQuestion: string,
    category: string,
    transcript: string,
    followUpNumber: number
  ): FollowUpResponse {
    const lower = transcript.toLowerCase();

    if (category.includes("Technical") || category.includes("System") || category.includes("Architecture")) {
      if (lower.includes("trade-off") || lower.includes("tradeoff") || lower.includes("choose") || lower.includes("decision")) {
        return {
          question: "What metric or feedback loop did you monitor to confirm that this design decision held up in production under load?",
          whyThisQuestion: "Evaluates empirical validation and operational awareness.",
          timeTargetMin: 45,
          timeTargetMax: 75,
          source: "vibelens_engine",
        };
      }
      return {
        question: "What was the most significant technical bottleneck or edge case you encountered while implementing that solution?",
        whyThisQuestion: "Probes real-world implementation depth and debugging resilience.",
        timeTargetMin: 45,
        timeTargetMax: 75,
        source: "vibelens_engine",
      };
    }

    if (category.includes("Leadership") || category.includes("Behavioral")) {
      if (lower.includes("team") || lower.includes("disagree") || lower.includes("stakeholder")) {
        return {
          question: "How did you ensure all parties remained aligned after that decision, and what would you refine if facing that dynamic again?",
          whyThisQuestion: "Evaluates cross-functional empathy and post-conflict alignment.",
          timeTargetMin: 45,
          timeTargetMax: 75,
          source: "vibelens_engine",
        };
      }
      return {
        question: "Looking back, what was your specific individual contribution versus the broader team's scope?",
        whyThisQuestion: "Clarifies ownership and individual agency within collective deliverables.",
        timeTargetMin: 45,
        timeTargetMax: 75,
        source: "vibelens_engine",
      };
    }

    if (followUpNumber === 2) {
      return {
        question: "What key lesson from that experience do you now apply to your daily engineering workflow?",
        whyThisQuestion: "Tests growth mindset and codified learning.",
        timeTargetMin: 45,
        timeTargetMax: 60,
        source: "vibelens_engine",
      };
    }

    return {
      question: "Could you walk through how you measured the tangible outcome or business impact of that effort?",
      whyThisQuestion: "Probes for quantifiable results and alignment with product impact.",
      timeTargetMin: 45,
      timeTargetMax: 75,
      source: "vibelens_engine",
    };
  }

  /**
   * Deep Answer Evaluation with Gemini AI
   */
  async evaluateAnswer(
    questionText: string,
    answerText: string,
    category: string
  ): Promise<{
    overallScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null> {
    if (!GeminiProvider.isConfigured()) return null;

    try {
      const prompt = `You are a Principal Engineering Interview Coach. Evaluate this candidate response:
Question: "${questionText}"
Category: "${category}"
Candidate Answer: "${answerText}"

Provide a JSON evaluation:
{
  "overallScore": 80,
  "feedback": "Concise 1-2 sentence evidence-based assessment",
  "strengths": ["Top 1-3 things done well"],
  "improvements": ["Top 1-3 specific actionable improvements"]
}`;

      return await GeminiProvider.generateStructured<any>(prompt, {
        feature: "interview_eval",
        model: ModelRouter.getFastModel(),
        timeoutMs: 12000,
      });
    } catch (err) {
      console.warn("[GeminiClient] AI evaluation fallback:", err);
    }
    return null;
  }

  /**
   * Generate interview questions tailored to Job Description, Resume, or Custom Context
   */
  async generateQuestionsFromContext(params: {
    contextText: string;
    role: string;
    difficulty: string;
    interviewType: string;
    count: number;
  }): Promise<Array<{
    question: string;
    category: string;
    subCategory?: string;
    criteria: string;
    whyThisQuestion: string;
    expectedConcepts: string[];
    acceptableConcepts: string[];
    commonMistakes: string[];
    referenceAnswer: string;
    hints: string[];
    followUpTemplates: string[];
    tags?: string[];
    skills?: string[];
  }> | null> {
    if (!GeminiProvider.isConfigured()) return null;

    try {
      const prompt = `You are an expert technical interviewer designing interview questions.
Context (Job Description / Resume):
"""
${params.contextText.slice(0, 2000)}
"""

Target Role: ${params.role}
Difficulty: ${params.difficulty}
Interview Type: ${params.interviewType}
Number of questions: ${params.count}

Generate ${params.count} high-quality interview questions tailored to the context.
Format response as a JSON array of objects:
[
  {
    "question": "Clear question string ending with ?",
    "category": "Technical Fundamentals | System Design | Product & Architecture | Behavioral Resilience | Project Discussion | Problem Solving | Communication | HR / General",
    "subCategory": "Specific topic",
    "criteria": "Evaluation criteria",
    "whyThisQuestion": "Why this evaluates candidate fit",
    "expectedConcepts": ["Required concept 1", "Required concept 2", "Required concept 3"],
    "acceptableConcepts": ["Acceptable alternative 1"],
    "commonMistakes": ["Common misconception 1"],
    "referenceAnswer": "Concise, expert 2-3 sentence reference answer.",
    "hints": ["Hint 1", "Hint 2"],
    "followUpTemplates": ["Follow-up question 1", "Follow-up question 2"],
    "tags": ["tag1", "tag2"],
    "skills": ["skill1", "skill2"]
  }
]`;

      const parsed = await GeminiProvider.generateStructured<any[]>(prompt, {
        feature: "question_generation",
        model: ModelRouter.getFastModel(),
        timeoutMs: 14000,
      });

      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn("[GeminiClient] AI question generation fallback:", err);
    }
    return null;
  }
}

export const geminiClient = new GeminiClient();
