import { GoogleGenAI } from "@google/genai";
import { ModelRouter } from "./modelRouter.js";
import { z } from "zod";

export interface GenerateTextOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  feature?: string;
}

export interface GenerateStructuredOptions<T = any> extends GenerateTextOptions {
  schema?: z.ZodType<T>;
  responseSchema?: Record<string, any>;
}

export interface MultimodalPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64
  };
}

export interface AiErrorPayload {
  success: false;
  errorCode: string;
  message: string;
  retryable: boolean;
}

export interface AiHealthResult {
  status: "ok" | "degraded" | "unconfigured";
  provider: "@google/genai";
  model: string;
  latencyMs?: number;
  timestamp: string;
  message?: string;
}

export class GeminiProvider {
  private static instance: GoogleGenAI | null = null;

  public static isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    const enabled = process.env.AI_ENABLED !== "false";
    return Boolean(enabled && key && key.trim().length > 10);
  }

  private static getClient(): GoogleGenAI {
    if (!this.isConfigured()) {
      throw new Error("AI service is not configured. GEMINI_API_KEY is missing or inactive.");
    }
    if (!this.instance) {
      const apiKey = process.env.GEMINI_API_KEY!.trim();
      this.instance = new GoogleGenAI({ apiKey });
    }
    return this.instance;
  }

  /**
   * Generates text content using Gemini with timeout, retry, and model failover
   */
  public static async generateText(
    prompt: string,
    options: GenerateTextOptions = {}
  ): Promise<string> {
    const feature = options.feature || "text_generation";
    const primaryModel = options.model || ModelRouter.getFastModel();
    const timeoutMs = options.timeoutMs || 15000;
    const maxRetries = 2;

    let currentModel = primaryModel;
    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= maxRetries) {
      attempt++;
      try {
        const client = this.getClient();
        const callPromise = client.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            temperature: options.temperature ?? 0.3,
            maxOutputTokens: options.maxOutputTokens ?? 2000,
            systemInstruction: options.systemInstruction,
          },
        });

        // Enforce timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        const latencyMs = Date.now() - startTime;
        const text = response?.text || "";

        this.logEvent({ feature, model: currentModel, latencyMs, status: "success" });
        return text;
      } catch (err: any) {
        const isLastAttempt = attempt > maxRetries;
        const errMsg = err?.message || String(err);
        const isUnavailable = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("ECONNRESET") || errMsg.includes("closed by the remote host");
        const isRateLimit = errMsg.includes("429") || errMsg.includes("ResourceExhausted");
        const isNotFound = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("models/");
        const isTimeout = errMsg.includes("timed out");

        // Failover from custom/new model to fallback fast model if model name was not recognized or temporary spike
        if ((isNotFound || isUnavailable) && currentModel !== ModelRouter.getFallbackFastModel()) {
          console.warn(`[GeminiProvider] Model ${currentModel} encountered ${isNotFound ? "not found" : "transient unavailability"}, failing over to ${ModelRouter.getFallbackFastModel()}`);
          currentModel = ModelRouter.getFallbackFastModel();
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        if (isLastAttempt || (!isRateLimit && !isTimeout && !errMsg.includes("500") && !errMsg.includes("503") && !isUnavailable)) {
          const latencyMs = Date.now() - startTime;
          this.logEvent({ feature, model: currentModel, latencyMs, status: "error", error: errMsg });
          throw this.normalizeError(err);
        }

        // Exponential backoff for transient errors
        const backoffMs = attempt * 800;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw new Error("Unable to complete AI request after retries.");
  }

  /**
   * Generates structured JSON adhering to a specified schema
   */
  public static async generateStructured<T>(
    prompt: string,
    options: GenerateStructuredOptions<T> = {}
  ): Promise<T> {
    const feature = options.feature || "structured_generation";
    const primaryModel = options.model || ModelRouter.getFastModel();
    const timeoutMs = options.timeoutMs || 20000;
    let currentModel = primaryModel;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const client = this.getClient();
        const callPromise = client.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            temperature: options.temperature ?? 0.2,
            maxOutputTokens: options.maxOutputTokens ?? 2500,
            systemInstruction: options.systemInstruction,
            responseMimeType: "application/json",
            responseSchema: options.responseSchema,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        const latencyMs = Date.now() - startTime;
        const rawText = response?.text?.trim() || "";

        // Strip any markdown backticks if returned
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(cleaned);

        // Validate with Zod schema if provided
        if (options.schema) {
          const validation = options.schema.safeParse(parsed);
          if (!validation.success) {
            console.warn(`[GeminiProvider] Schema validation warning:`, validation.error.format());
            // If attempt 1 fails schema validation, retry with stronger formatting instructions
            if (attempt === 1) {
              prompt += `\n\nCRITICAL: The previous output failed schema validation. You MUST return strictly valid JSON matching the exact required schema fields.`;
              continue;
            }
          } else {
            this.logEvent({ feature, model: currentModel, latencyMs, status: "success" });
            return validation.data;
          }
        }

        this.logEvent({ feature, model: currentModel, latencyMs, status: "success" });
        return parsed as T;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isUnavailable = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("ECONNRESET") || errMsg.includes("closed by the remote host");
        const isNotFound = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("models/");
        if ((isNotFound || isUnavailable) && currentModel !== ModelRouter.getFallbackFastModel()) {
          console.warn(`[GeminiProvider] Structured model ${currentModel} failover to ${ModelRouter.getFallbackFastModel()}`);
          currentModel = ModelRouter.getFallbackFastModel();
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        if (attempt === 2) {
          this.logEvent({ feature, model: currentModel, latencyMs: Date.now() - startTime, status: "error", error: errMsg });
          throw this.normalizeError(err);
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    throw new Error("Unable to generate valid structured response from Gemini.");
  }

  /**
   * Multimodal analysis (Image, PDF documents, Audio snippets)
   */
  public static async analyzeMultimodal(
    parts: MultimodalPart[],
    options: GenerateStructuredOptions = {}
  ): Promise<any> {
    const feature = options.feature || "multimodal_analysis";
    const primaryModel = options.model || ModelRouter.getFastModel();
    const timeoutMs = options.timeoutMs || 25000;
    const client = this.getClient();
    let currentModel = primaryModel;
    const startTime = Date.now();

    // Map parts into @google/genai contents structure
    const contentParts: any[] = [];
    for (const p of parts) {
      if (p.text) {
        contentParts.push({ text: p.text });
      }
      if (p.inlineData) {
        contentParts.push({
          inlineData: {
            mimeType: p.inlineData.mimeType,
            data: p.inlineData.data,
          },
        });
      }
    }

    try {
      const callPromise = client.models.generateContent({
        model: currentModel,
        contents: contentParts,
        config: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxOutputTokens ?? 3000,
          responseMimeType: "application/json",
          systemInstruction: options.systemInstruction,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Multimodal analysis timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const response: any = await Promise.race([callPromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;
      const rawText = response?.text?.trim() || "";
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);

      this.logEvent({ feature, model: currentModel, latencyMs, status: "success" });
      return parsed;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isUnavailable = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("ECONNRESET");
      if ((errMsg.includes("404") || isUnavailable) && currentModel !== ModelRouter.getFallbackFastModel()) {
        // Try fallback model
        return this.analyzeMultimodal(parts, { ...options, model: ModelRouter.getFallbackFastModel() });
      }
      this.logEvent({ feature, model: currentModel, latencyMs: Date.now() - startTime, status: "error", error: errMsg });
      throw this.normalizeError(err);
    }
  }

  /**
   * Health check verifying connectivity without leaking credentials
   */
  public static async healthCheck(): Promise<AiHealthResult> {
    const timestamp = new Date().toISOString();
    if (!this.isConfigured()) {
      return {
        status: "unconfigured",
        provider: "@google/genai",
        model: ModelRouter.getFastModel(),
        timestamp,
        message: "Gemini API key is not configured on the server.",
      };
    }

    const startTime = Date.now();
    try {
      const text = await this.generateText("Respond with 'VibeLens Brain Online' in exactly 3 words.", {
        timeoutMs: 8000,
        maxOutputTokens: 20,
        feature: "health_check",
      });
      const latencyMs = Date.now() - startTime;

      return {
        status: "ok",
        provider: "@google/genai",
        model: ModelRouter.getFastModel(),
        latencyMs,
        timestamp,
        message: text.trim() || "VibeLens Brain Online",
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        status: "degraded",
        provider: "@google/genai",
        model: ModelRouter.getFastModel(),
        latencyMs,
        timestamp,
        message: err.message || "Gemini service temporarily unreachable.",
      };
    }
  }

  /**
   * Converts low-level errors into safe, client-friendly error objects
   */
  private static normalizeError(err: any): Error {
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes("429") || rawMsg.includes("ResourceExhausted")) {
      return new Error("AI request limit reached. Please wait a moment before retrying.");
    }
    if (rawMsg.includes("timed out")) {
      return new Error("AI analysis timed out. Please try again.");
    }
    if (rawMsg.includes("401") || rawMsg.includes("403") || rawMsg.includes("API key not valid")) {
      return new Error("AI service authentication error. Please verify server configuration.");
    }
    if (rawMsg.includes("SAFETY") || rawMsg.includes("blocked")) {
      return new Error("Content could not be processed due to safety and content policy boundaries.");
    }
    return new Error("VibeLens couldn't complete the AI analysis. Please try again.");
  }

  /**
   * Internal sanitized telemetry logging (Never logs keys, passwords, or PII)
   */
  private static logEvent(event: {
    feature: string;
    model: string;
    latencyMs: number;
    status: "success" | "error";
    error?: string;
  }) {
    if (process.env.NODE_ENV !== "test") {
      const safeError = event.error ? ` [${event.error.slice(0, 80)}]` : "";
      console.log(
        `[VibeLens AI] feature=${event.feature} model=${event.model} status=${event.status} latency=${event.latencyMs}ms${safeError}`
      );
    }
  }
}
