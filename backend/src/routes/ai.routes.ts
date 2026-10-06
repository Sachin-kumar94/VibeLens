import { Router } from "express";
import { AiController } from "../controllers/ai.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Apply optional authentication so requests carry user info if logged in
router.use(optionalAuth);

// Diagnostics & Health (Points 23, 24)
router.get("/health", AiController.health);
router.post("/test", AiController.test);

// Chat / Study Assistant ("Ask VibeLens") grounded RAG Q&A
router.post("/chat", AiController.chat);

// Interview AI modules
router.post("/interview/question", AiController.generateInterviewQuestion);
router.post("/interview/evaluate", AiController.evaluateInterviewAnswer);
router.post("/interview/follow-up", AiController.generateFollowUp);

// Document AI modules (Quiz, Flashcards, Summary)
router.post("/documents/quiz", AiController.generateQuiz);
router.post("/documents/flashcards", AiController.generateFlashcards);
router.post("/documents/summary", AiController.generateSummary);

// Study Aliases (Point 83)
router.post("/study/quiz", AiController.generateQuiz);
router.post("/study/flashcards", AiController.generateFlashcards);
router.post("/study/summary", AiController.generateSummary);

// Resume & JD extraction
router.post("/resume/analyze", AiController.analyzeResume);
router.post("/jd/analyze", AiController.analyzeJobDescription);

// Personalized 7-Day Study Plan
router.post("/study-plan", AiController.generateStudyPlan);

// Candidate Memory
router.get("/memory", AiController.getMemory);

// AI Semantic Search
router.post("/search", AiController.search);

// "Explain This" & "Ask about My Result"
router.post("/explain", AiController.explain);

// Multimodal Fusion & Signal Interpretation AI
router.post("/image", AiController.analyzeImage);
router.post("/voice/analyze", AiController.analyzeVoice);
router.post("/body/analyze", AiController.analyzeBody);
router.post("/fusion/analyze", AiController.analyzeFusion);

export default router;
