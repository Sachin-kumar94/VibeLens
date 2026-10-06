import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Save,
  Sparkles,
  Layers,
  MessageSquarePlus,
  Play,
  Pause,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Mic,
} from "lucide-react";
import { IntegritySignalsPanel } from "./IntegritySignalsPanel";
import { IntegrityEvent } from "../../hooks/useIntegritySignals";
import { RecordedAnswerData } from "./InterviewRecorder";
import { ExplainModal } from "../study/ExplainModal";
import { HelpCircle } from "lucide-react";

interface StructureBreakdown {
  framework: string;
  detectedSteps: string[];
  missingSteps: string[];
}

export interface EvaluationData {
  status?: "CORRECT" | "MOSTLY_CORRECT" | "PARTIALLY_CORRECT" | "WEAK" | "INCORRECT" | "INSUFFICIENT_INFORMATION" | "NOT_EVALUATABLE";
  overallScore: number;
  structureScore: number;
  relevanceScore: number;
  clarityScore: number;
  evidenceScore: number;
  deliveryScore: number;
  categoryScores?: {
    technical: number;
    communication: number;
    structure: number;
    delivery: number;
  } | string;
  structureBreakdown?: StructureBreakdown;
  strengths: string[] | string;
  improvements: string[] | string;
  nextPractice: string[] | string;
  whyThisAssessment?: string;
  missingConcepts?: string[] | string;
  incorrectConcepts?: Array<{ claim: string; problem: string; correctConcept: string }> | string;
  referenceAnswer?: string;
  improvedAnswer?: string;
  simpleExplanation?: string;
  sourceCitations?: string[] | string;
  rememberRule?: string;
  attemptComparison?: {
    previousScore: number;
    currentScore: number;
    difference: number;
    summary: string;
  } | string;
  feedback?: string;
  transcriptObservations?: string;
  deliveryObservations?: string;
  paceState?: string;
}

interface InterviewFeedbackProps {
  evaluation: EvaluationData;
  recordedData?: RecordedAnswerData | null;
  userAnswerText?: string;
  attemptNumber?: number;
  integrityEvents?: IntegrityEvent[];
  onRetake: () => void;
  onNextQuestion: () => void;
  onAskFollowUp?: () => void;
  canAskFollowUp?: boolean;
  isGeneratingFollowUp?: boolean;
  onSaveAnswer: () => void;
  isSaved: boolean;
  isSaving: boolean;
  hasNextQuestion: boolean;
}

export const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  evaluation,
  recordedData,
  userAnswerText,
  attemptNumber,
  integrityEvents = [],
  onRetake,
  onNextQuestion,
  onAskFollowUp,
  canAskFollowUp = false,
  isGeneratingFollowUp = false,
  onSaveAnswer,
  isSaved,
  isSaving,
  hasNextQuestion,
}) => {
  const {
    overallScore = 0,
    structureScore = 0,
    relevanceScore = 0,
    clarityScore = 0,
    evidenceScore = 0,
    deliveryScore = 0,
    structureBreakdown,
    strengths = [],
    improvements = [],
    nextPractice = [],
    feedback,
    transcriptObservations,
    deliveryObservations,
    paceState,
  } = evaluation;

  // Media Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(recordedData?.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasVideo = Boolean(recordedData?.hasVisualData && recordedData?.videoQuality !== "Unavailable");
  const activeMedia = hasVideo ? videoRef.current : audioRef.current;

  useEffect(() => {
    if (activeMedia) {
      activeMedia.playbackRate = playbackRate;
    }
  }, [playbackRate, activeMedia]);

  const togglePlay = () => {
    if (!activeMedia) return;
    if (isPlaying) {
      activeMedia.pause();
      setIsPlaying(false);
    } else {
      activeMedia.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (activeMedia) {
      setCurrentTime(activeMedia.currentTime);
      if (Number.isFinite(activeMedia.duration) && activeMedia.duration > 0) {
        setMediaDuration(activeMedia.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (activeMedia) {
      activeMedia.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (activeMedia) {
      activeMedia.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (activeMedia) {
      activeMedia.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Safe integrity events fallback
  const activeIntegrityEvents = integrityEvents.length > 0 ? integrityEvents : recordedData?.integrityEvents || [];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-6 shadow-sm animate-in fade-in">
      {/* 1. Wireframe Header: Answer Review */}
      <div className="border-b border-[#DDD7CB]/70 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A]">
            Answer Review
          </h3>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono text-[#575A60]">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <Clock size={12} className="text-[#71889C]" />
            <span>Duration: {formatTime(mediaDuration || recordedData?.duration || 0)}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <CheckCircle2 size={12} className="text-[#10B981]" />
            <span>Audio ✓</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <CheckCircle2 size={12} className={hasVideo ? "text-[#10B981]" : "text-[#7D7971]"} />
            <span>{hasVideo ? "Video ✓" : "Audio Track"}</span>
          </span>
        </div>
      </div>

      {/* 2. Media Player Viewport */}
      {recordedData?.mediaUrl && (
        <div className="space-y-3">
          <div className="relative aspect-video max-h-[380px] w-full bg-[#15171A] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {hasVideo ? (
              <video
                ref={videoRef}
                src={recordedData.mediaUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <audio
                  ref={audioRef}
                  src={recordedData.mediaUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
                  <Mic size={28} className={isPlaying ? "text-[#10B981] animate-pulse" : "text-white/60"} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">Recorded Spoken Response</span>
                  <span className="text-xs text-white/60 font-mono">
                    {formatTime(currentTime)} / {formatTime(mediaDuration)}
                  </span>
                </div>
              </div>
            )}

            {/* Play/Pause Button Overlay */}
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-xs flex items-center justify-center text-white transition cursor-pointer hover:scale-108 shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-1" />}
            </button>
          </div>

          {/* Scrub Bar & Player Toolbar */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-white border border-[#DDD7CB]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#575A60] min-w-[38px] text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={mediaDuration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-[#FAF8F5] border border-[#DDD7CB] rounded-full appearance-none cursor-pointer accent-[#15171A]"
              />
              <span className="font-mono text-xs text-[#575A60] min-w-[38px]">
                {formatTime(mediaDuration)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-3 py-1.5 rounded-xl bg-[#15171A] text-white font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[#252833] transition"
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>

                <div className="flex items-center rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] p-0.5">
                  {[1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackRate(speed)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                        playbackRate === speed
                          ? "bg-white font-bold text-[#15171A] shadow-2xs"
                          : "text-[#575A60] hover:text-[#15171A]"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-[#575A60] hover:text-[#15171A] cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-[#DDD7CB] rounded-full appearance-none cursor-pointer accent-[#15171A]"
                  />
                </div>

                {hasVideo && (
                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="p-1 text-[#575A60] hover:text-[#15171A] hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Wireframe Transcript / Typed Answer Block */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15171A] block">
          Your Answer {attemptNumber && attemptNumber > 1 ? `(Attempt ${attemptNumber})` : ""}
        </span>
        <div className="border-t border-[#DDD7CB] pt-2.5">
          <p className="text-xs text-[#575A60] leading-relaxed italic whitespace-pre-wrap">
            {userAnswerText || recordedData?.transcript || transcriptObservations || "No answer recorded."}
          </p>
        </div>
      </div>

      {/* Attempt Comparison Banner if this is a retry attempt */}
      {evaluation.attemptComparison && (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 shrink-0" />
            <div>
              <strong className="block font-bold">
                Attempt Comparison: Attempt {(attemptNumber || 2) - 1} ({typeof evaluation.attemptComparison === "string" ? JSON.parse(evaluation.attemptComparison).previousScore : evaluation.attemptComparison.previousScore}/100) → Attempt {attemptNumber || 2} ({typeof evaluation.attemptComparison === "string" ? JSON.parse(evaluation.attemptComparison).currentScore : evaluation.attemptComparison.currentScore}/100)
              </strong>
              <p className="text-[11px] text-blue-700 mt-0.5">
                {typeof evaluation.attemptComparison === "string" ? JSON.parse(evaluation.attemptComparison).summary : evaluation.attemptComparison.summary}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 font-mono font-bold text-blue-800 text-xs shrink-0">
            {(typeof evaluation.attemptComparison === "string" ? JSON.parse(evaluation.attemptComparison).difference : evaluation.attemptComparison.difference) >= 0 ? "+" : ""}
            {typeof evaluation.attemptComparison === "string" ? JSON.parse(evaluation.attemptComparison).difference : evaluation.attemptComparison.difference} pts
          </span>
        </div>
      )}

      {/* 4. Deep Answer Status & Rubric Scores */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD7CB]/70 pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#7D7971]">Practice Score (Rubric-based)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl sm:text-5xl font-bold font-serif text-[#15171A]">
                {overallScore}
              </span>
              <span className="text-sm font-sans text-[#7D7971]">/ 100</span>
            </div>
          </div>

          {/* Semantic Status Badge & Explain Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExplainOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} className="text-amber-700" />
              <span>Explain Score</span>
            </button>
            {(() => {
              const status = evaluation.status || (overallScore >= 88 ? "CORRECT" : overallScore >= 75 ? "MOSTLY_CORRECT" : overallScore >= 60 ? "PARTIALLY_CORRECT" : overallScore >= 45 ? "WEAK" : "INCORRECT");
              switch (status) {
                case "CORRECT":
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>✓ Correct</span>
                    </div>
                  );
                case "MOSTLY_CORRECT":
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-teal-50 text-teal-800 border-teal-300">
                      <CheckCircle2 size={15} className="text-teal-600" />
                      <span>✓ Mostly Correct</span>
                    </div>
                  );
                case "PARTIALLY_CORRECT":
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-amber-50 text-amber-800 border-amber-300">
                      <AlertCircle size={15} className="text-amber-600" />
                      <span>◐ Partially Correct</span>
                    </div>
                  );
                case "WEAK":
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-orange-50 text-orange-800 border-orange-300">
                      <AlertCircle size={15} className="text-orange-600" />
                      <span>⚠ Needs More Detail</span>
                    </div>
                  );
                case "INCORRECT":
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-rose-50 text-rose-800 border-rose-300">
                      <AlertCircle size={15} className="text-rose-600" />
                      <span>✕ Incorrect</span>
                    </div>
                  );
                default:
                  return (
                    <div className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 bg-slate-50 text-slate-800 border-slate-300">
                      <AlertCircle size={15} className="text-slate-600" />
                      <span>ℹ Incomplete</span>
                    </div>
                  );
              }
            })()}
          </div>
        </div>

        {/* Rubric Category Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
            <span className="text-[#575A60]">Structure</span>
            <strong className="text-base text-[#15171A]">{structureScore}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
            <span className="text-[#575A60]">Relevance</span>
            <strong className="text-base text-[#15171A]">{relevanceScore}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
            <span className="text-[#575A60]">Clarity</span>
            <strong className="text-base text-[#15171A]">{clarityScore}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
            <span className="text-[#575A60]">Delivery</span>
            <strong className="text-base text-[#15171A]">{deliveryScore}</strong>
          </div>
        </div>
      </div>

      {/* 5. "Why this assessment?" (Evidence from Candidate Answer) */}
      {(evaluation.whyThisAssessment || feedback) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15171A]">
            <Sparkles size={14} className="text-[#C18A69]" />
            <span>Why this assessment?</span>
          </div>
          <p className="text-[#575A60] leading-relaxed text-xs">
            {evaluation.whyThisAssessment || feedback}
          </p>
        </div>
      )}

      {/* 6. Incorrect Concept Detection ("What needs correction") */}
      {(() => {
        let incorrectArr: Array<{ claim: string; problem: string; correctConcept: string }> = [];
        if (evaluation.incorrectConcepts) {
          if (Array.isArray(evaluation.incorrectConcepts)) {
            incorrectArr = evaluation.incorrectConcepts;
          } else {
            try { incorrectArr = JSON.parse(evaluation.incorrectConcepts); } catch (e) {}
          }
        }
        if (incorrectArr.length === 0) return null;

        return (
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
              <AlertCircle size={15} className="text-rose-600" />
              <span>What needs correction</span>
            </div>
            <div className="space-y-2.5">
              {incorrectArr.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/80 border border-rose-100 space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-rose-800">Identified claim: </span>
                    <span className="text-slate-700 italic">"{item.claim}"</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Problem: </span>
                    <span className="text-slate-600">{item.problem}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-800">Correct concept: </span>
                    <span className="text-slate-700">{item.correctConcept}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 7. What you got right & Missing concepts side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* What you got right */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>What you got right</span>
          </div>
          <ul className="space-y-2 text-xs text-[#575A60]">
            {(Array.isArray(strengths) ? strengths : typeof strengths === "string" ? JSON.parse(strengths || "[]") : []).map((str: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Concepts or Focus next */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#786D9D]">
            <ArrowRight size={15} className="text-[#786D9D]" />
            <span>{evaluation.missingConcepts ? "Missing required concepts" : "What needs improvement"}</span>
          </div>
          <ul className="space-y-2 text-xs text-[#575A60]">
            {(() => {
              let items: string[] = [];
              if (evaluation.missingConcepts) {
                items = Array.isArray(evaluation.missingConcepts) ? evaluation.missingConcepts : JSON.parse(evaluation.missingConcepts as string || "[]");
              }
              if (items.length === 0) {
                items = Array.isArray(improvements) ? improvements : typeof improvements === "string" ? JSON.parse(improvements || "[]") : [];
              }
              return items.map((it: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#786D9D] font-bold shrink-0">→</span>
                  <span>{it}</span>
                </li>
              ));
            })()}
          </ul>
        </div>
      </div>

      {/* 8. Remember Rule Box (Mental Model) */}
      {evaluation.rememberRule && (
        <div className="p-4 rounded-2xl bg-[#F5F2EB] border border-[#DDD7CB] flex items-start gap-3 text-xs text-[#15171A]">
          <span className="px-2 py-0.5 rounded-md bg-[#15171A] text-white font-mono text-[10px] uppercase font-bold shrink-0 mt-0.5">
            Remember
          </span>
          <p className="font-medium text-xs leading-relaxed">
            {evaluation.rememberRule}
          </p>
        </div>
      )}

      {/* Simple Explanation (Section 62) */}
      {evaluation.simpleExplanation && (
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Sparkles size={14} className="text-amber-600" />
            <span>Simple Explanation (In Plain English)</span>
          </div>
          <p className="text-amber-950 leading-relaxed">
            {evaluation.simpleExplanation}
          </p>
        </div>
      )}

      {/* Source Citations (Sections 34, 37) */}
      {evaluation.sourceCitations && (
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#575A60]">
            <span className="font-semibold text-[#15171A]">Source Grounding:</span>
            <span className="font-mono text-[11px] text-[#15171A] bg-white px-2 py-0.5 rounded border border-[#E5E0D5]">
              {Array.isArray(evaluation.sourceCitations)
                ? evaluation.sourceCitations.join(", ")
                : typeof evaluation.sourceCitations === "string"
                ? (() => {
                    try { return JSON.parse(evaluation.sourceCitations).join(", "); } catch (e) { return evaluation.sourceCitations; }
                  })()
                : evaluation.sourceCitations}
            </span>
          </div>
        </div>
      )}

      {/* 9. Better Interview Answer / Reference Direction */}
      {(evaluation.improvedAnswer || evaluation.referenceAnswer) && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15171A]">
            <Sparkles size={14} className="text-[#10B981]" />
            <span>Strong Interview Answer Example</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]/70 text-[#15171A] leading-relaxed italic">
            "{evaluation.improvedAnswer || evaluation.referenceAnswer}"
          </div>
          <span className="text-[11px] text-[#7D7971] block">
            A strong interview response addresses technical constraints, operational mechanics, and trade-offs directly.
          </span>
        </div>
      )}

      {/* Synthesized Feedback Quote if available */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-1.5 text-xs text-[#575A60]">
          <span className="font-bold text-[#15171A] text-[11px] block flex items-center gap-1.5 font-mono uppercase">
            <Sparkles size={13} className="text-[#10B981]" />
            <span>Evaluator Synthesis</span>
          </span>
          <p className="leading-relaxed text-xs">{feedback}</p>
        </div>
      )}

      {/* 6. Action Buttons: [ Try Follow-up ] [ Next Question ] [ Save ] [ Retake ] */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#DDD7CB]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
          >
            <RotateCcw size={13} />
            <span>Retake Question</span>
          </button>

          <button
            type="button"
            onClick={onSaveAnswer}
            disabled={isSaved || isSaving}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isSaved
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white border-[#DDD7CB] text-[#15171A] hover:bg-[#FAF8F5]"
            }`}
          >
            <Save size={13} />
            <span>{isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {canAskFollowUp && onAskFollowUp && (
            <button
              type="button"
              onClick={onAskFollowUp}
              disabled={isGeneratingFollowUp}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#786D9D] hover:bg-[#786D9D]/5 text-[#786D9D] text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition disabled:opacity-50"
            >
              {isGeneratingFollowUp ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#786D9D] border-t-transparent rounded-full animate-spin" />
                  <span>Generating Follow-Up...</span>
                </>
              ) : (
                <>
                  <MessageSquarePlus size={14} />
                  <span>Try Follow-up</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onNextQuestion}
            className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition hover:scale-102"
          >
            <span>{hasNextQuestion ? "Next Question" : "Finish Interview"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 7. Collapsible Assistance & Integrity Signals Panel per Req 30-50 */}
      <IntegritySignalsPanel events={activeIntegrityEvents} />

      {/* Transparent Disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-[#8C8983] bg-white p-3 rounded-xl border border-[#DDD7CB]/60">
        <AlertCircle size={14} className="shrink-0 text-[#8C8983] mt-0.5" />
        <p className="leading-relaxed">
          Interview feedback is an automated practice aid based on your response and available audio/video signals. It does not predict hiring or employment outcomes.
        </p>
      </div>

      {/* AI Explain This Modal */}
      <ExplainModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        type={evaluation.status === "INCORRECT" || evaluation.status === "WEAK" ? "why_wrong" : "score"}
        score={overallScore}
        contextText={evaluation.simpleExplanation || evaluation.feedback || "Score and rubric evaluation breakdown"}
        candidateAnswer={userAnswerText || recordedData?.transcript}
      />
    </div>
  );
};
