import React, { useState, useEffect, useCallback } from "react";
import {
  interviewApi,
  InterviewQuestionItem,
  InterviewSessionItem,
  InterviewAnswerItem,
  InterviewReportPayload,
} from "../services/interviewApi";
import { useAuth } from "../context/AuthContext";
import { InterviewHeader } from "../components/interview/InterviewHeader";
import { InterviewCategoryTabs } from "../components/interview/InterviewCategoryTabs";
import { InterviewSetupModal, InterviewSessionConfig } from "../components/interview/InterviewSetupModal";
import { DeviceCheckModal } from "../components/interview/DeviceCheckModal";
import { InterviewLobby } from "../components/interview/InterviewLobby";
import { PreparationTimer } from "../components/interview/PreparationTimer";
import { InterviewQuestionCard } from "../components/interview/InterviewQuestionCard";
import { InterviewRecorder, RecordedAnswerData } from "../components/interview/InterviewRecorder";
import { InterviewReview } from "../components/interview/InterviewReview";
import { InterviewFeedback } from "../components/interview/InterviewFeedback";
import { FollowUpCard } from "../components/interview/FollowUpCard";
import { InterviewQuestionDrawer } from "../components/interview/InterviewQuestionDrawer";
import { CustomQuestionModal } from "../components/interview/CustomQuestionModal";
import { InterviewReportModal } from "../components/interview/InterviewReportModal";
import { DocumentLibraryModal } from "../components/interview/DocumentLibraryModal";
import { AskVibeLensModal } from "../components/study/AskVibeLensModal";
import { StudyPlanModal } from "../components/study/StudyPlanModal";
import { documentApi } from "../services/documentApi";
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
} from "lucide-react";

interface InterviewPageProps {
  onNavigate: (path: string) => void;
}

type WorkspaceState =
  | "IDLE"
  | "PREPARE"
  | "RECORDING"
  | "REVIEW"
  | "EVALUATING"
  | "EVALUATED"
  | "FOLLOW_UP";

const DRAFT_STORAGE_KEY = "vibelens_active_interview_draft";

export const InterviewPage: React.FC<InterviewPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Questions & Filtering State
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [interviewType, setInterviewType] = useState<string>("Behavioral");
  const [difficulty, setDifficulty] = useState<string>("Intermediate");
  const [cameraMode, setCameraMode] = useState<"enabled" | "audio_only">("enabled");
  const [targetMin, setTargetMin] = useState<number>(60);
  const [targetMax, setTargetMax] = useState<number>(90);
  const [followUpsEnabled, setFollowUpsEnabled] = useState<boolean>(true);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<"Interview" | "Practice" | "Study">("Interview");
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [submittedTextAnswer, setSubmittedTextAnswer] = useState<string>("");

  // Active Session & Answers State
  const [currentSession, setCurrentSession] = useState<InterviewSessionItem | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<Set<string>>(new Set());
  const [currentAnswer, setCurrentAnswer] = useState<InterviewAnswerItem | null>(null);
  const [recordedData, setRecordedData] = useState<RecordedAnswerData | null>(null);
  const [currentFollowUp, setCurrentFollowUp] = useState<InterviewQuestionItem | null>(null);
  const [followUpNumber, setFollowUpNumber] = useState<number>(1);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);

  // UI Flow & Modals State
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("IDLE");
  const [saveStatus, setSaveStatus] = useState<"not_saved" | "saving" | "saved" | "error">("not_saved");
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDeviceCheckOpen, setIsDeviceCheckOpen] = useState(false);
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState(false);
  const [isAskVibeLensOpen, setIsAskVibeLensOpen] = useState(false);
  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
  const [finalReport, setFinalReport] = useState<InterviewReportPayload | null>(null);
  const [previousSessionScore, setPreviousSessionScore] = useState<number | null>(null);

  // Active Document Sources state
  const [activeSources, setActiveSources] = useState({
    hasResume: false,
    hasJd: false,
    hasStudyMaterials: false,
    hasStandard: true,
  });

  const refreshSourceStatus = useCallback(async () => {
    try {
      const docs = await documentApi.getDocuments();
      setActiveSources({
        hasResume: docs.some((d) => d.sourceType === "RESUME" && d.status === "READY"),
        hasJd: docs.some((d) => d.sourceType === "JOB_DESCRIPTION" && d.status === "READY" && d.isSelectedForInterview),
        hasStudyMaterials: docs.some((d) => d.sourceType === "STUDY_MATERIAL" && d.status === "READY" && d.isSelectedForInterview),
        hasStandard: true,
      });
    } catch (e) {
      console.warn("Could not check active sources:", e);
    }
  }, []);

  useEffect(() => {
    refreshSourceStatus();
  }, [refreshSourceStatus]);

  // Draft recovery banner state
  const [draftSessionData, setDraftSessionData] = useState<{
    sessionId: string;
    role: string;
    questionIndex: number;
  } | null>(null);

  // Loading & Error States
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [evaluatingStage, setEvaluatingStage] = useState<string>("Transcribing spoken response...");

  // 1. Check for draft session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.sessionId) {
          setDraftSessionData(parsed);
        }
      }
    } catch (e) {
      // ignore parsing errors
    }
  }, []);

  // 2. Load Question Bank with graceful fallback
  const loadQuestions = useCallback(async (cat: string, role: string, diff: string) => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    try {
      let data = await interviewApi.getQuestions({
        category: cat === "All" ? undefined : cat,
        role: role === "All" ? undefined : role,
        difficulty: diff === "All" || diff === "Mixed" ? undefined : diff,
      });

      // If category or difficulty yielded zero results, fallback to all role questions
      if (!data || data.length === 0) {
        data = await interviewApi.getQuestions({
          role: role === "All" ? undefined : role,
        });
      }

      // If still empty, fallback to system questions
      if (!data || data.length === 0) {
        data = await interviewApi.getQuestions({});
      }

      setQuestions(data);
      setActiveQuestionIndex(0);
      setWorkspaceState("IDLE");
      setRecordedData(null);
      setCurrentAnswer(null);
    } catch (err: any) {
      console.error("Failed to load interview questions:", err);
      setLoadError(err.message || "Failed to load questions from server.");
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions(activeCategory, selectedRole, difficulty);
  }, [activeCategory, selectedRole, difficulty, loadQuestions]);

  // Safety guard against dangling workspace states
  useEffect(() => {
    if (workspaceState === "REVIEW" && !recordedData) {
      setWorkspaceState("IDLE");
    }
    if (workspaceState === "EVALUATED" && (!currentAnswer || !currentAnswer.evaluation)) {
      setWorkspaceState("IDLE");
    }
    if (workspaceState === "FOLLOW_UP" && !currentFollowUp) {
      setWorkspaceState("IDLE");
    }
  }, [workspaceState, recordedData, currentAnswer, currentFollowUp]);

  // Load previous sessions to determine comparative scores
  useEffect(() => {
    const fetchPreviousScore = async () => {
      try {
        const pastSessions = await interviewApi.getSessions();
        if (pastSessions && pastSessions.length > 0) {
          const completed = pastSessions.filter((s) => s.status === "COMPLETED");
          if (completed.length > 0) {
            const latest = completed[0];
            if (latest.averageScore) {
              setPreviousSessionScore(latest.averageScore);
            } else if (latest.answers && latest.answers.length > 0) {
              const scored = latest.answers.filter((a) => a.evaluation?.overallScore);
              if (scored.length > 0) {
                setPreviousSessionScore(
                  Math.round(scored.reduce((sum, a) => sum + (a.evaluation?.overallScore || 0), 0) / scored.length)
                );
              }
            }
          }
        }
      } catch (e) {
        // non-blocking
      }
    };
    fetchPreviousScore();
  }, []);

  // Active question item
  const activeQuestion = questions[activeQuestionIndex] || {
    id: "q_default",
    category: "Product & Architecture",
    role: "Product Engineer",
    difficulty: "Intermediate",
    question: "What trade-offs did you evaluate while designing your most critical full-stack project?",
    criteria: "Clear opening thesis, tangible system trade-offs, structured delivery, concrete engineering evidence.",
    timeTargetMin: targetMin,
    timeTargetMax: targetMax,
    whyThisQuestion: "Reveals how you weigh architectural elegance against operational scalability and resilience.",
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
    },
  };

  // Question counts per category for the tabs
  const questionCounts = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Start new practice session from Setup Modal
  const handleConfigureSession = async (config: InterviewSessionConfig) => {
    setSelectedRole(config.role);
    setInterviewType(config.interviewType);
    setDifficulty(config.difficulty);
    if (config.practiceMode) setPracticeMode(config.practiceMode);
    setCameraMode(config.cameraMode);
    setTargetMin(config.targetMin);
    setTargetMax(config.targetMax);
    setFollowUpsEnabled(config.followUpsEnabled);
    setAdaptiveDifficulty(config.adaptiveDifficulty);

    try {
      const createdSession = await interviewApi.createSession({
        role: config.role,
        position: config.position,
        experienceRange: config.experienceRange,
        interviewType: config.interviewType,
        category: activeCategory,
        difficulty: config.difficulty,
        maxDifficulty: config.maxDifficulty,
        practiceMode: config.learningMode || config.practiceMode,
        learningMode: config.learningMode,
        questionSources: config.questionSources,
        questionCount: config.questionCount,
        targetDuration: config.targetDuration,
        targetMin: config.targetMin,
        targetMax: config.targetMax,
        cameraMode: config.cameraMode,
        followUpsEnabled: config.followUpsEnabled,
        adaptiveDifficulty: config.adaptiveDifficulty,
        jobDescription: config.jobDescription,
        resumeText: config.resumeText,
      });

      // If initial curated/dynamic questions returned with session, use them directly
      if (createdSession.initialQuestions && createdSession.initialQuestions.length > 0) {
        setQuestions(createdSession.initialQuestions);
      } else if (config.jobDescription && config.jobDescription.trim().length > 20) {
        // If job description provided, generate questions
        try {
          const jdQuestions = await interviewApi.generateQuestionsFromJd(
            config.jobDescription,
            config.role,
            config.difficulty
          );
          if (jdQuestions.length > 0) {
            setQuestions(jdQuestions);
          }
        } catch (e) {
          console.warn("JD generation notice:", e);
        }
      }

      setCurrentSession(createdSession);
      setAnsweredQuestionIds(new Set());
      setSkippedQuestionIds(new Set());
      setActiveQuestionIndex(0);
      setWorkspaceState("IDLE");
      setRecordedData(null);
      setCurrentAnswer(null);

      // Save draft key
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          sessionId: createdSession.id,
          role: config.role,
          questionIndex: 0,
        })
      );

      // Open Device Check next (no auto camera permission on page load!)
      setIsDeviceCheckOpen(true);
    } catch (err: any) {
      console.warn("Session creation notice:", err);
      // Fallback: still open device check
      setIsDeviceCheckOpen(true);
    }
  };

  // Device check confirmed -> proceed to Lobby
  const handleDeviceCheckComplete = () => {
    setIsDeviceCheckOpen(false);
    setIsLobbyOpen(true);
  };

  // Lobby start interview -> start session on server and begin Question 1 preparation
  const handleLobbyStart = async () => {
    setIsLobbyOpen(false);
    if (currentSession?.id) {
      try {
        await interviewApi.startSession(currentSession.id);
      } catch (e) {
        console.warn("Start session notice:", e);
      }
    }
    // Transition to 30-sec preparation phase
    setWorkspaceState("PREPARE");
  };

  // Preparation Complete / Skipped -> Start Interviewer asking
  const handlePreparationComplete = () => {
    setWorkspaceState("RECORDING");
    setRecordedData(null);
  };

  // Cancel Recording -> return to Idle/Prepare
  const handleCancelRecording = () => {
    setWorkspaceState("IDLE");
    setRecordedData(null);
  };

  // Recording Complete -> Review
  const handleRecordingComplete = (data: RecordedAnswerData) => {
    setRecordedData(data);
    setWorkspaceState("REVIEW");
  };

  // Retake answer (Try this question again)
  const handleRetake = () => {
    setAttemptNumber((prev) => prev + 1);
    setRecordedData(null);
    setCurrentAnswer(null);
    setWorkspaceState("IDLE");
    setSaveStatus("not_saved");
  };

  // Submit Answer for Real Evaluation
  const handleSubmitAnswerForAnalysis = async () => {
    if (!recordedData || !activeQuestion) return;

    setWorkspaceState("EVALUATING");
    setSaveStatus("saving");
    setEvaluatingStage("Transcribing spoken response...");

    try {
      // 1. Ensure active session ID
      let sessionId = currentSession?.id;
      if (!sessionId) {
        const session = await interviewApi.createSession({
          role: selectedRole,
          interviewType,
          category: activeCategory,
          difficulty,
          cameraMode,
          targetMin,
          targetMax,
          followUpsEnabled,
          adaptiveDifficulty,
        });
        setCurrentSession(session);
        sessionId = session.id;
      }

      // Progress stage updates
      const t1 = setTimeout(() => setEvaluatingStage("Evaluating answer structure & rubric thesis..."), 700);
      const t2 = setTimeout(() => setEvaluatingStage("Measuring delivery cadence & pause patterns..."), 1400);
      const t3 = setTimeout(() => setEvaluatingStage("Checking technical integrity signals..."), 2100);

      // 2. Upload recording media blob if size > 0
      let mediaUrl = recordedData.mediaUrl;
      try {
        if (recordedData.blob && recordedData.blob.size > 0) {
          const ext = "webm";
          const uploadRes = await interviewApi.uploadMedia(
            recordedData.blob,
            `answer_${sessionId}_${activeQuestion.id}.${ext}`
          );
          if (uploadRes && uploadRes.fileUrl) {
            mediaUrl = uploadRes.fileUrl;
          }
        }
      } catch (uploadErr) {
        console.warn("Media upload notice (using memory blob URL):", uploadErr);
      }

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setEvaluatingStage("Finalizing objective score synthesis...");

      // 3. Save Answer and run deterministic evaluator on server
      const answerRecord = await interviewApi.saveAndEvaluateAnswer(sessionId, {
        questionId: activeQuestion.id,
        parentAnswerId: isAnsweringFollowUp && currentAnswer ? currentAnswer.id : undefined,
        answerType: isAnsweringFollowUp ? "FOLLOW_UP_1" : "PRIMARY",
        attemptNumber,
        duration: recordedData.duration,
        audioUrl: !recordedData.hasVisualData ? mediaUrl : undefined,
        videoUrl: recordedData.hasVisualData ? mediaUrl : undefined,
        transcript: recordedData.transcript,
        wpm: recordedData.wpm,
        pauseCount: recordedData.pauseCount,
        avgPauseDuration: recordedData.avgPauseDuration,
        longestPause: recordedData.longestPause,
        fillerCount: recordedData.fillerCount,
        fillerRate: recordedData.fillerRate,
        cameraFacingSignal: recordedData.cameraFacingSignal,
        faceVisibility: recordedData.faceVisibility,
        postureSignal: recordedData.postureSignal,
        framingQuality: recordedData.framingQuality,
        audioQuality: recordedData.audioQuality,
        videoQuality: recordedData.videoQuality,
        hasVisualData: recordedData.hasVisualData,
        integrityEvents: recordedData.integrityEvents,
      });

      setCurrentAnswer(answerRecord);
      setAnsweredQuestionIds((prev) => new Set(prev).add(activeQuestion.id));
      setIsAnsweringFollowUp(false);
      setSaveStatus("saved");
      setWorkspaceState("EVALUATED");

      // Update draft storage
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          sessionId,
          role: selectedRole,
          questionIndex: activeQuestionIndex,
        })
      );
    } catch (err: any) {
      console.error("Evaluation submission error:", err);
      setSaveStatus("error");
      setWorkspaceState("REVIEW");
      alert(err.message || "Could not analyze answer. Please check connection and retry.");
    }
  };

  // Submit typed text answer
  const handleSubmitTextAnswer = async (text: string) => {
    if (!text.trim() || !activeQuestion) return;

    setWorkspaceState("EVALUATING");
    setSaveStatus("saving");
    setEvaluatingStage("Analyzing answer against question rubrics...");
    setSubmittedTextAnswer(text);

    try {
      let sessionId = currentSession?.id;
      if (!sessionId) {
        const session = await interviewApi.createSession({
          role: selectedRole,
          interviewType,
          category: activeCategory,
          difficulty,
          cameraMode,
          targetMin,
          targetMax,
          followUpsEnabled,
          adaptiveDifficulty,
        });
        setCurrentSession(session);
        sessionId = session.id;
      }

      const answerRecord = await interviewApi.saveAndEvaluateAnswer(sessionId, {
        questionId: activeQuestion.id,
        parentAnswerId: isAnsweringFollowUp && currentAnswer ? currentAnswer.id : undefined,
        answerType: isAnsweringFollowUp ? "FOLLOW_UP_1" : "PRIMARY",
        attemptNumber,
        textAnswer: text,
        duration: 0,
        transcript: text,
      });

      setCurrentAnswer(answerRecord);
      setAnsweredQuestionIds((prev) => new Set(prev).add(activeQuestion.id));
      setIsAnsweringFollowUp(false);
      setSaveStatus("saved");
      setWorkspaceState("EVALUATED");

      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          sessionId,
          role: selectedRole,
          questionIndex: activeQuestionIndex,
        })
      );
    } catch (err: any) {
      console.error("Text evaluation submission error:", err);
      setSaveStatus("error");
      setWorkspaceState("IDLE");
      alert(err.message || "Could not analyze answer. Please check connection and retry.");
    }
  };

  // Follow-Up Request Handler
  const handleAskFollowUp = async () => {
    if (!currentAnswer?.id) return;
    setIsGeneratingFollowUp(true);

    try {
      const followUpData = await interviewApi.generateFollowUp(currentAnswer.id);
      if (followUpData.question) {
        setCurrentFollowUp(followUpData.question);
        setFollowUpNumber(followUpData.followUpNumber || 1);
        setWorkspaceState("FOLLOW_UP");
      } else {
        alert(followUpData.message || "No further follow-up necessary for this question.");
      }
    } catch (err: any) {
      console.warn("Follow-up generation error:", err);
      alert("Could not generate follow-up question. Proceeding to next main question.");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // Start Answering Follow-up
  const handleStartFollowUpAnswer = () => {
    if (!currentFollowUp) return;
    setIsAnsweringFollowUp(true);
    setWorkspaceState("PREPARE");
    setRecordedData(null);
  };

  // Skip Follow-up -> Next Question
  const handleSkipFollowUp = () => {
    setCurrentFollowUp(null);
    setIsAnsweringFollowUp(false);
    handleNextQuestion();
  };

  // Navigation: Next Question
  const handleNextQuestion = async () => {
    setCurrentFollowUp(null);
    setIsAnsweringFollowUp(false);
    setAttemptNumber(1);
    setSubmittedTextAnswer("");

    // If adaptive difficulty is enabled and session exists, fetch next adapted question
    if (currentSession?.adaptiveDifficulty && currentSession?.id) {
      try {
        const nextQRes = await interviewApi.getNextQuestion(currentSession.id);
        if (nextQRes.question && !questions.some((q) => q.id === nextQRes.question!.id)) {
          setQuestions((prev) => [...prev, nextQRes.question!]);
        }
      } catch (e) {
        console.warn("Adaptive next question fetch notice:", e);
      }
    }

    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setWorkspaceState("PREPARE");
      setRecordedData(null);
      setCurrentAnswer(null);
      setSaveStatus("not_saved");
    } else {
      // Last question reached
      handleFinishInterview();
    }
  };

  // Skip Question without scoring
  const handleSkipQuestion = () => {
    setCurrentFollowUp(null);
    setIsAnsweringFollowUp(false);

    if (activeQuestion?.id) {
      setSkippedQuestionIds((prev) => new Set(prev).add(activeQuestion.id));
    }

    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setWorkspaceState("IDLE");
      setRecordedData(null);
      setCurrentAnswer(null);
      setSaveStatus("not_saved");
    } else {
      handleFinishInterview();
    }
  };

  // Conclude Interview Session & Generate Report
  const handleFinishInterview = async () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftSessionData(null);

    if (!currentSession?.id) {
      setIsReportOpen(true);
      return;
    }

    try {
      const res = await interviewApi.finishSession(currentSession.id);
      setFinalReport(res.report);
      setIsReportOpen(true);
    } catch (err: any) {
      console.warn("Finish session notice:", err);
      setIsReportOpen(true);
    }
  };

  // Draft resumption handlers
  const handleResumeDraft = async () => {
    if (!draftSessionData) return;
    try {
      setIsLoadingQuestions(true);
      const session = await interviewApi.getSession(draftSessionData.sessionId);
      if (session) {
        setCurrentSession(session);
        setSelectedRole(session.role);
        setInterviewType(session.interviewType);
        setDifficulty(session.difficulty);
        if (session.practiceMode) setPracticeMode(session.practiceMode);

        if (session.questions && session.questions.length > 0) {
          setQuestions(session.questions.map((sq: any) => sq.question || sq));
        } else {
          await loadQuestions("All", session.role, session.difficulty);
        }

        setActiveQuestionIndex(draftSessionData.questionIndex || 0);
        setWorkspaceState("IDLE");
        setDraftSessionData(null);
        return;
      }
    } catch (err) {
      console.warn("Could not resume saved draft session:", err);
    } finally {
      setIsLoadingQuestions(false);
    }

    // Fallback if session wasn't found in DB:
    if (draftSessionData.role) {
      setSelectedRole(draftSessionData.role);
      await loadQuestions("All", draftSessionData.role, difficulty);
    }
    setActiveQuestionIndex(draftSessionData.questionIndex || 0);
    setWorkspaceState("IDLE");
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftSessionData(null);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftSessionData(null);
    setCurrentSession(null);
    setWorkspaceState("IDLE");
    loadQuestions(activeCategory, selectedRole, difficulty);
  };

  // Save Custom Question Handler
  const handleSaveCustomQuestion = async (customQ: any) => {
    const created = await interviewApi.createCustomQuestion(customQ);
    setQuestions((prev) => [created, ...prev]);
    setActiveCategory(created.category);
    setActiveQuestionIndex(0);
  };

  // Helper to parse string or string[] safely
  const parseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [String(val)];
    }
  };

  const strengths: string[] = parseList(currentAnswer?.evaluation?.strengths);
  const improvements: string[] = parseList(currentAnswer?.evaluation?.improvements);
  const nextPractice: string[] = parseList(currentAnswer?.evaluation?.nextPractice);
  const structureBreakdown: any = (currentAnswer?.evaluation as any)?.structureBreakdown;

  // Active question prompt text for interviewer
  const currentPromptText = isAnsweringFollowUp && currentFollowUp
    ? currentFollowUp.question
    : activeQuestion.question;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 animate-in fade-in">
      {/* 1. Header with live device indicators */}
      <InterviewHeader
        onNavigate={onNavigate}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenManageSources={() => setIsDocLibraryOpen(true)}
        onOpenStudyAssistant={() => setIsAskVibeLensOpen(true)}
        onOpenStudyPlan={() => setIsStudyPlanOpen(true)}
        activeSources={activeSources}
        hasActiveSession={Boolean(currentSession)}
        cameraReady={cameraMode === "enabled"}
        micReady={true}
        selectedRole={selectedRole}
        interviewType={interviewType}
      />

      {/* Draft Session Resume Banner if present */}
      {draftSessionData && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <RotateCcw size={15} className="text-amber-700 shrink-0" />
            <span>
              Unfinished practice rehearsal detected for <strong>{draftSessionData.role}</strong> (Question {draftSessionData.questionIndex + 1}).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResumeDraft}
              className="px-3.5 py-1.5 rounded-xl bg-amber-800 text-white font-semibold hover:bg-amber-900 transition cursor-pointer"
            >
              Resume Rehearsal
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* 2. Category Selector & Custom Question Bar */}
      <InterviewCategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveQuestionIndex(0);
          setWorkspaceState("IDLE");
          setRecordedData(null);
          setCurrentAnswer(null);
        }}
        questionCounts={questionCounts}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Loading or Error states for Question Bank */}
      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-600" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={() => loadQuestions(activeCategory, selectedRole, difficulty)}
            className="px-3 py-1 rounded-lg bg-white border border-rose-200 font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}



      {/* 3. Loading questions indicator */}
      {isLoadingQuestions && (
        <div className="p-12 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-3 shadow-sm animate-pulse">
          <div className="w-8 h-8 border-2 border-[#15171A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7D7971]">Loading interview questions...</p>
        </div>
      )}

      {/* 4. Dynamic Main Hero Stage */}
      {!isLoadingQuestions && (
        <div className="space-y-6">
          {/* State 1: IDLE (Reading question) */}
          {workspaceState === "IDLE" && (
            <InterviewQuestionCard
              question={activeQuestion}
              questionIndex={activeQuestionIndex}
              totalQuestions={Math.max(1, questions.length)}
              isRecording={false}
              onStartRecord={handlePreparationComplete}
              onStartPrepare={() => setWorkspaceState("PREPARE")}
              onSkipQuestion={handleSkipQuestion}
              cameraMode={cameraMode}
              onToggleCameraMode={(mode) => setCameraMode(mode)}
              onOpenQuestionList={() => setIsDrawerOpen(true)}
              practiceMode={practiceMode}
              onSubmitTextAnswer={handleSubmitTextAnswer}
            />
          )}

          {/* State 2: PREPARE (Question at top + 30s preparation countdown) */}
          {workspaceState === "PREPARE" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-sm animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between text-xs text-[#7D7971] gap-2 border-b border-[#DDD7CB]/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#15171A] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
                      Question {activeQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="font-medium text-[#575A60]">{activeQuestion.category}</span>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium bg-sky-50 text-sky-800 border-sky-200">
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#575A60] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
                    <Clock size={12} className="text-[#71889C]" />
                    <span>
                      Target: {activeQuestion.timeTargetMin || 60}–{activeQuestion.timeTargetMax || 90} sec
                    </span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A] leading-snug">
                  "{currentPromptText}"
                </h2>
              </div>

              <PreparationTimer
                initialSeconds={30}
                onStartAnswer={handlePreparationComplete}
                onSkipPreparation={handlePreparationComplete}
                questionCriteria={activeQuestion.criteria}
                whyThisQuestion={activeQuestion.whyThisQuestion}
              />
            </div>
          )}

          {/* State 3: RECORDING (Question at top + Active live camera, real audio, minimal metrics) */}
          {workspaceState === "RECORDING" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-sm animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between text-xs text-[#7D7971] gap-2 border-b border-[#DDD7CB]/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#15171A] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
                      Question {activeQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="font-medium text-[#575A60]">{activeQuestion.category}</span>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium bg-sky-50 text-sky-800 border-sky-200">
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#575A60] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
                    <Clock size={12} className="text-[#71889C]" />
                    <span>
                      Target: {activeQuestion.timeTargetMin || 60}–{activeQuestion.timeTargetMax || 90} sec
                    </span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A] leading-snug">
                  "{currentPromptText}"
                </h2>
              </div>

              <InterviewRecorder
                isRecording={true}
                cameraMode={cameraMode}
                targetTimeMin={targetMin}
                targetTimeMax={targetMax}
                onRecordingComplete={handleRecordingComplete}
                onCancelRecording={handleCancelRecording}
              />
            </div>
          )}

          {/* State 4: REVIEW (Recorded playback, seek, speed, retake, analyze) */}
          {workspaceState === "REVIEW" && recordedData && (
            <InterviewReview
              data={recordedData}
              onRetake={handleRetake}
              onSubmitForAnalysis={handleSubmitAnswerForAnalysis}
              isAnalyzing={false}
            />
          )}

          {/* State 5: EVALUATING (Deterministic synthesis progress) */}
          {workspaceState === "EVALUATING" && (
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#DDD7CB] space-y-4 text-center shadow-sm animate-in fade-in">
              <div className="w-10 h-10 border-3 border-[#15171A] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-lg text-[#15171A]">{evaluatingStage}</h4>
                <p className="text-xs text-[#7D7971] max-w-md mx-auto leading-relaxed">
                  Evaluating answer structure, relevance, clarity, delivery pace, and observable interaction signals.
                </p>
              </div>
            </div>
          )}

          {/* State 6: EVALUATED (Response Score 0-100, What worked, What could improve, Try next, Follow-up, Integrity) */}
          {workspaceState === "EVALUATED" && currentAnswer && currentAnswer.evaluation && (
            <InterviewFeedback
              evaluation={{
                status: currentAnswer.evaluation.status as any,
                overallScore: currentAnswer.evaluation.overallScore,
                structureScore: currentAnswer.evaluation.structureScore,
                relevanceScore: currentAnswer.evaluation.relevanceScore,
                clarityScore: currentAnswer.evaluation.clarityScore,
                evidenceScore: currentAnswer.evaluation.evidenceScore,
                deliveryScore: currentAnswer.evaluation.deliveryScore,
                structureBreakdown,
                strengths,
                improvements,
                nextPractice,
                whyThisAssessment: currentAnswer.evaluation.whyThisAssessment,
                missingConcepts: currentAnswer.evaluation.missingConcepts,
                incorrectConcepts: currentAnswer.evaluation.incorrectConcepts as any,
                referenceAnswer: currentAnswer.evaluation.referenceAnswer,
                improvedAnswer: currentAnswer.evaluation.improvedAnswer,
                rememberRule: (currentAnswer.evaluation as any).rememberRule,
                attemptComparison: (currentAnswer.evaluation as any).attemptComparison,
                feedback: currentAnswer.evaluation.feedback,
                transcriptObservations: currentAnswer.evaluation.transcriptObservations,
                deliveryObservations: currentAnswer.evaluation.deliveryObservations,
                paceState: (currentAnswer.evaluation as any).paceState,
              }}
              recordedData={recordedData}
              userAnswerText={submittedTextAnswer || recordedData?.transcript || currentAnswer?.transcript || currentAnswer?.textAnswer}
              attemptNumber={attemptNumber}
              integrityEvents={recordedData?.integrityEvents}
              onRetake={handleRetake}
              onNextQuestion={handleNextQuestion}
              onAskFollowUp={handleAskFollowUp}
              canAskFollowUp={followUpsEnabled && !isAnsweringFollowUp}
              isGeneratingFollowUp={isGeneratingFollowUp}
              onSaveAnswer={() => setSaveStatus("saved")}
              isSaved={saveStatus === "saved"}
              isSaving={saveStatus === "saving"}
              hasNextQuestion={activeQuestionIndex < questions.length - 1}
            />
          )}

          {/* State 7: FOLLOW_UP (Adaptive candidate-specific follow-up probe) */}
          {workspaceState === "FOLLOW_UP" && currentFollowUp && (
            <FollowUpCard
              followUpNumber={followUpNumber}
              followUpQuestion={currentFollowUp}
              onAcceptFollowUp={handleStartFollowUpAnswer}
              onSkipFollowUp={handleSkipFollowUp}
            />
          )}

          {/* Compact Question Progress Bar per Req 27, 69, 71, 72 */}
          {questions.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#15171A]">
                  {answeredQuestionIds.size} of {questions.length} completed
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isAnswered = answeredQuestionIds.has(q.id);
                  const isSkipped = skippedQuestionIds.has(q.id);
                  const isCurrent = idx === activeQuestionIndex;

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => {
                        if (workspaceState === "IDLE" || workspaceState === "EVALUATED") {
                          setActiveQuestionIndex(idx);
                          setWorkspaceState("IDLE");
                          setRecordedData(null);
                          setCurrentAnswer(null);
                        }
                      }}
                      disabled={workspaceState === "RECORDING" || workspaceState === "EVALUATING"}
                      className={`px-3 py-1 rounded-xl font-mono text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-[#15171A] text-white font-bold shadow-xs"
                          : isAnswered
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isSkipped
                          ? "bg-zinc-100 text-zinc-500 border border-zinc-200 line-through opacity-75"
                          : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB] hover:bg-white hover:text-[#15171A]"
                      }`}
                      title={`Question ${idx + 1}: ${q.category}`}
                    >
                      <span>{idx + 1}</span>
                      {isAnswered && <CheckCircle2 size={12} className="text-emerald-600" />}
                      {isCurrent && <span className="text-[10px] font-sans font-normal opacity-85">Current</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFinishConfirmOpen(true)}
                  disabled={answeredQuestionIds.size === 0 && skippedQuestionIds.size === 0}
                  className="px-3 py-1.5 rounded-xl border border-[#DDD7CB] text-xs font-semibold text-[#575A60] hover:text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  Finish early
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Finish Confirmation Dialog Modal (Req 72) */}
      {isFinishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#15171A]">Finish Practice Session?</h3>
            <p className="text-xs sm:text-sm text-[#575A60] leading-relaxed">
              You've answered {answeredQuestionIds.size} of {questions.length} questions. Finish now to view your practice summary report?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDD7CB]">
              <button
                type="button"
                onClick={() => setIsFinishConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#575A60] hover:text-[#15171A] border border-[#DDD7CB] hover:bg-white transition cursor-pointer"
              >
                Continue Practice
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFinishConfirmOpen(false);
                  handleFinishInterview();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Finish & View Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modals & Workflow Dialogs */}
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartSession={handleConfigureSession}
        currentRole={selectedRole}
        currentType={interviewType}
        currentDifficulty={difficulty}
      />

      <DeviceCheckModal
        isOpen={isDeviceCheckOpen}
        onClose={() => setIsDeviceCheckOpen(false)}
        onProceed={handleDeviceCheckComplete}
        cameraMode={cameraMode}
      />

      {isLobbyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <InterviewLobby
              candidateName={user?.name || "Candidate"}
              role={selectedRole}
              interviewType={interviewType}
              difficulty={difficulty}
              questionCount={questions.length || 5}
              cameraMode={cameraMode}
              onStartInterview={handleLobbyStart}
              onOpenSettings={() => {
                setIsLobbyOpen(false);
                setIsSetupOpen(true);
              }}
              onRecheckDevices={() => {
                setIsLobbyOpen(false);
                setIsDeviceCheckOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <CustomQuestionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveCustomQuestion={handleSaveCustomQuestion}
      />

      <InterviewQuestionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        questions={questions}
        currentIndex={activeQuestionIndex}
        onSelectIndex={(idx) => {
          setActiveQuestionIndex(idx);
          setWorkspaceState("IDLE");
          setRecordedData(null);
          setCurrentAnswer(null);
          setSaveStatus("not_saved");
        }}
        answeredQuestionIds={answeredQuestionIds}
        onSkipQuestion={handleSkipQuestion}
      />

      <InterviewReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        previousSessionScore={previousSessionScore}
        onOpenStudyPlan={() => {
          setIsReportOpen(false);
          setIsStudyPlanOpen(true);
        }}
        onAskVibeLens={() => {
          setIsReportOpen(false);
          setIsAskVibeLensOpen(true);
        }}
        report={
          finalReport || {
            sessionId: currentSession?.id || "ses_active",
            role: selectedRole,
            interviewType,
            difficulty,
            createdAt: new Date().toISOString(),
            totalDurationSeconds: currentAnswer?.duration || 0,
            averageScore: currentAnswer?.evaluation?.overallScore || 0,
            averageWpm: currentAnswer?.wpm || 0,
            totalQuestionsAnswered: answeredQuestionIds.size,
            totalQuestionsPlanned: questions.length || 5,
            answers: currentAnswer
              ? [
                  {
                    questionText: activeQuestion.question,
                    category: activeQuestion.category,
                    difficulty: activeQuestion.difficulty,
                    criteria: activeQuestion.criteria,
                    duration: currentAnswer.duration,
                    wpm: currentAnswer.wpm,
                    pauseCount: currentAnswer.pauseCount,
                    fillerCount: currentAnswer.fillerCount,
                    cameraFacingSignal: currentAnswer.cameraFacingSignal,
                    audioQuality: currentAnswer.audioQuality,
                    evaluation: currentAnswer.evaluation
                      ? {
                          overallScore: currentAnswer.evaluation.overallScore,
                          structureScore: currentAnswer.evaluation.structureScore,
                          relevanceScore: currentAnswer.evaluation.relevanceScore,
                          clarityScore: currentAnswer.evaluation.clarityScore,
                          deliveryScore: currentAnswer.evaluation.deliveryScore,
                          evidenceScore: currentAnswer.evaluation.evidenceScore,
                          strengths,
                          improvements,
                          nextPractice,
                          feedback: currentAnswer.evaluation.feedback,
                        }
                      : undefined,
                  },
                ]
              : [],
            integritySummary: currentSession?.answers
              ? undefined
              : {
                  majorInterruptions: 0,
                  focusChanges: recordedData?.integrityEvents?.filter((e) => e.type === "WINDOW_BLUR").length || 0,
                  faceVisibilityPct: recordedData?.faceVisibility || 100,
                  audioInterruptions: 0,
                },
            overallStrengths: strengths.length > 0 ? strengths : ["Structured thesis presented clearly."],
            overallImprovements: improvements.length > 0 ? improvements : ["Incorporate quantitative engineering trade-offs."],
            recommendedPracticePlan: nextPractice.length > 0 ? nextPractice : ["Practice a focused 60–90 second answer leading with recommendation."],
            disclaimer:
              "Interview feedback is an automated practice aid based on your response and available audio/video signals. It does not predict hiring or employment outcomes.",
          }
        }
      />

      {/* 5. Document Library & Interview Profile Modal */}
      <DocumentLibraryModal
        isOpen={isDocLibraryOpen}
        onClose={() => setIsDocLibraryOpen(false)}
        onDocumentsUpdated={refreshSourceStatus}
      />

      {/* 6. Ask VibeLens Study Assistant Modal */}
      <AskVibeLensModal
        isOpen={isAskVibeLensOpen}
        onClose={() => setIsAskVibeLensOpen(false)}
      />

      {/* 7. 7-Day Personalized Practice Plan Modal */}
      <StudyPlanModal
        isOpen={isStudyPlanOpen}
        onClose={() => setIsStudyPlanOpen(false)}
        targetRole={selectedRole}
      />
    </div>
  );
};

export default InterviewPage;
