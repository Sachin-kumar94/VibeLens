/**
 * VibeLens Gemini Model Router
 * Dynamically routes AI tasks to appropriate Gemini models based on task complexity,
 * latency requirements, and modality.
 * All model identifiers are environment-configurable with robust fallbacks.
 */

export class ModelRouter {
  /**
   * Fast Model: Routine chat, question generation, answer evaluation, summaries, insights, classification
   * Default: gemini-3.6-flash or environment configured
   */
  public static getFastModel(): string {
    return process.env.GEMINI_FAST_MODEL || "gemini-3.6-flash";
  }

  /**
   * Fallback Fast Model: Used when primary fast model encounters transient provider issues, 503, or 404
   */
  public static getFallbackFastModel(): string {
    return "gemini-3.1-flash-lite";
  }

  /**
   * Reasoning Model: Deep multi-session synthesis, complex system architecture evaluations
   * Default: gemini-3.1-pro-preview or environment configured
   */
  public static getReasoningModel(): string {
    return process.env.GEMINI_REASONING_MODEL || "gemini-3.1-pro-preview";
  }

  /**
   * Live Model: Real-time bidirectional voice/video interview practice
   * Default: gemini-3.8-live or environment configured
   */
  public static getLiveModel(): string {
    return process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
  }

  /**
   * TTS Model: Natural speech synthesis for interviewer questions
   * Default: gemini-3.8-flash-tts or environment configured
   */
  public static getTtsModel(): string {
    return process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts";
  }

  /**
   * Transcribe Model: Low-latency candidate speech-to-text
   * Default: gemini-3.5-transcribe or environment configured
   */
  public static getTranscribeModel(): string {
    return process.env.GEMINI_TRANSCRIBE_MODEL || "gemini-3.5-transcribe";
  }
}
