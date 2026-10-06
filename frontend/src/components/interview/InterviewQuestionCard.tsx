import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Clock,
  Timer,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Video,
  VideoOff,
  Sparkles,
} from "lucide-react";
import { InterviewQuestionItem } from "../../services/interviewApi";

interface InterviewQuestionCardProps {
  question: InterviewQuestionItem;
  questionIndex: number;
  totalQuestions: number;
  isRecording: boolean;
  onStartRecord: () => void;
  onStartPrepare: () => void;
  onSkipQuestion?: () => void;
  cameraMode: "enabled" | "audio_only";
  onToggleCameraMode?: (mode: "enabled" | "audio_only") => void;
  onOpenQuestionList?: () => void;
  onSubmitTextAnswer?: (text: string) => void;
  practiceMode?: "Interview" | "Practice" | "Study";
}

export const InterviewQuestionCard: React.FC<InterviewQuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  isRecording,
  onStartRecord,
  onStartPrepare,
  onSkipQuestion,
  cameraMode,
  onToggleCameraMode,
  onOpenQuestionList,
  onSubmitTextAnswer,
  practiceMode = "Interview",
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showKeyConcepts, setShowKeyConcepts] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Reset hints and text on question change
  useEffect(() => {
    setTextAnswer("");
    setRevealedHints(0);
    setShowKeyConcepts(false);
  }, [question.id]);

  // Stop TTS if question changes or component unmounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question.id]);

  const handleToggleAudio = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel")) &&
        v.lang.startsWith("en")
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    utteranceRef.current = utterance;
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Intermediate":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Advanced":
        return "bg-violet-50 text-violet-800 border-violet-200";
      case "Expert":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-6 shadow-sm">
      {/* 1. Question Header per Req 05 */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#7D7971] gap-2 border-b border-[#DDD7CB]/70 pb-3">
        <div className="flex items-center gap-2">
          {onOpenQuestionList ? (
            <button
              type="button"
              onClick={onOpenQuestionList}
              className="font-mono text-[11px] font-semibold text-[#15171A] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]"
            >
              Question {questionIndex + 1} of {totalQuestions}
            </button>
          ) : (
            <span className="font-mono text-[11px] font-semibold text-[#15171A] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
          )}
          <span className="font-medium text-[#575A60]">{question.category}</span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>

          {/* Question Source Badge (Section 35) */}
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              question.sourceType === "RESUME"
                ? "bg-[#E8F8F5] border-[#A3E4D7] text-[#117A65]"
                : question.sourceType === "JOB_DESCRIPTION"
                ? "bg-[#EBF5FB] border-[#AED6F1] text-[#1B4F72]"
                : question.sourceType === "STUDY_MATERIAL"
                ? "bg-[#F4ECF7] border-[#D7BDE2] text-[#6C3483]"
                : question.sourceType === "CUSTOM"
                ? "bg-[#FEF9E7] border-[#F9E79F] text-[#7D6608]"
                : "bg-white border-[#DDD7CB] text-[#575A60]"
            }`}
          >
            {question.sourceType === "RESUME"
              ? "Resume-based"
              : question.sourceType === "JOB_DESCRIPTION"
              ? "JD-based"
              : question.sourceType === "STUDY_MATERIAL"
              ? "Study material"
              : question.sourceType === "CUSTOM"
              ? "Custom"
              : "Standard"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#575A60] bg-white px-2.5 py-1 rounded-lg border border-[#DDD7CB]">
          <Clock size={12} className="text-[#71889C]" />
          <span>
            Target: {question.timeTargetMin || 60}–{question.timeTargetMax || 90} seconds
          </span>
        </div>
      </div>

      {/* Source Citation Display & View Source Button (Sections 34, 37, 88, 89, 142) */}
      {question.sourceCitation && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] text-xs">
          <div className="flex items-center gap-2 text-[#575A60]">
            <span className="font-semibold text-[#15171A]">Based on:</span>
            <span className="font-mono text-[11px] text-[#15171A] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E0D5]">
              {question.sourceCitation}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCriteria(true)}
            className="text-xs font-semibold text-[#15171A] hover:underline cursor-pointer"
          >
            View Source Details
          </button>
        </div>
      )}

      {/* 2. Primary Question as the Visual Focus per Req 06 */}
      <div className="space-y-3">
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#15171A] leading-snug">
          "{question.question}"
        </h2>

        {/* Hear Question Audio Button with Replay & Stop */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isPlayingAudio
                ? "bg-[#15171A] text-white border-[#15171A]"
                : "bg-white border-[#DDD7CB] text-[#575A60] hover:text-[#15171A] hover:bg-[#FAF8F5]"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Pause size={12} className="fill-current text-[#10B981]" />
                <span>Pause Question</span>
              </>
            ) : (
              <>
                <Volume2 size={12} className="text-[#71889C]" />
                <span>Hear Question</span>
              </>
            )}
          </button>

          {isPlayingAudio && (
            <button
              type="button"
              onClick={() => {
                if ("speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl border border-[#DDD7CB] bg-white text-xs text-[#7D7971] hover:text-[#15171A] cursor-pointer"
              title="Stop audio"
            >
              <VolumeX size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Collapsible: "Why this question?" per Req 07 (collapsed by default) */}
      {question.whyThisQuestion && (
        <div className="border border-[#DDD7CB] rounded-2xl bg-white overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="w-full p-3 flex items-center justify-between text-left font-medium text-[#575A60] hover:text-[#15171A] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={13} className="text-[#C18A69]" />
              <span className="font-semibold text-[#15171A]">Why this question?</span>
            </div>
            {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showWhy && (
            <div className="px-3 pb-3 text-[#575A60] leading-relaxed text-xs border-t border-[#DDD7CB]/50 pt-2 animate-in fade-in">
              {question.whyThisQuestion}
            </div>
          )}
        </div>
      )}

      {/* 4. Collapsible: "What we're looking for" per Req 08 (collapsed by default) */}
      <div className="border border-[#DDD7CB] rounded-2xl bg-white overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowCriteria(!showCriteria)}
          className="w-full p-3 flex items-center justify-between text-left font-medium text-[#575A60] hover:text-[#15171A] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#10B981]" />
            <span className="font-semibold text-[#15171A]">What we're looking for</span>
          </div>
          {showCriteria ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showCriteria && (
          <div className="p-3.5 space-y-2.5 border-t border-[#DDD7CB]/50 text-xs text-[#575A60] leading-relaxed animate-in fade-in">
            {question.criteria && <p className="text-xs text-[#15171A]">{question.criteria}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <strong className="block text-[#15171A]">Structure</strong>
                <span className="text-[10px] text-[#7D7971]">Clear opening & resolution</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <strong className="block text-[#15171A]">Relevance</strong>
                <span className="text-[10px] text-[#7D7971]">Answers prompt directly</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <strong className="block text-[#15171A]">Clarity</strong>
                <span className="text-[10px] text-[#7D7971]">Concise phrase boundaries</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <strong className="block text-[#15171A]">Evidence</strong>
                <span className="text-[10px] text-[#7D7971]">Tangible metrics or examples</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Practice Mode Hints & Key Concepts Drawer */}
      {(practiceMode === "Practice" || (question.hints && question.hints.length > 0)) && (
        <div className="border border-amber-200/80 rounded-2xl bg-amber-50/40 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-amber-950 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-600" />
              <span>Practice Mode Guidance</span>
            </span>

            <div className="flex items-center gap-2">
              {question.hints && question.hints.length > 0 && revealedHints < question.hints.length && (
                <button
                  type="button"
                  onClick={() => setRevealedHints((prev) => prev + 1)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-medium hover:bg-amber-50 cursor-pointer shadow-2xs"
                >
                  Reveal Hint {revealedHints + 1} of {question.hints.length}
                </button>
              )}

              {question.expectedConcepts && question.expectedConcepts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowKeyConcepts(!showKeyConcepts)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-medium hover:bg-amber-50 cursor-pointer shadow-2xs"
                >
                  {showKeyConcepts ? "Hide Key Concepts" : "Reveal Key Concepts"}
                </button>
              )}
            </div>
          </div>

          {/* Revealed Hints */}
          {revealedHints > 0 && question.hints && (
            <div className="space-y-1.5 pt-1">
              {question.hints.slice(0, revealedHints).map((hint, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200/70 text-amber-950 leading-relaxed text-xs">
                  <span className="font-bold font-mono text-[10px] text-amber-700 uppercase mr-1.5">Hint {idx + 1}:</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}

          {/* Key Concepts Preview */}
          {showKeyConcepts && question.expectedConcepts && (
            <div className="p-3 rounded-xl bg-white border border-amber-200/70 space-y-1.5">
              <span className="font-bold text-amber-950 text-xs block">Key concepts expected in response:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                {question.expectedConcepts.map((concept, idx) => (
                  <li key={idx}>{concept}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. Mode Switch: Voice/Video vs Text Answer */}
      <div className="flex items-center justify-between border-t border-[#DDD7CB]/70 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTextMode(false)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              !isTextMode
                ? "bg-[#15171A] text-white border-[#15171A]"
                : "bg-white border-[#DDD7CB] text-[#575A60] hover:text-[#15171A]"
            }`}
          >
            Spoken Answer (Mic / Camera)
          </button>
          <button
            type="button"
            onClick={() => setIsTextMode(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isTextMode
                ? "bg-[#15171A] text-white border-[#15171A]"
                : "bg-white border-[#DDD7CB] text-[#575A60] hover:text-[#15171A]"
            }`}
          >
            Type Answer (Textarea)
          </button>
        </div>

        {/* Camera Modality Toggle (when in voice mode) */}
        {!isTextMode && onToggleCameraMode && (
          <button
            type="button"
            onClick={() => onToggleCameraMode(cameraMode === "enabled" ? "audio_only" : "enabled")}
            className="flex items-center gap-1.5 text-xs text-[#575A60] hover:text-[#15171A] cursor-pointer"
          >
            {cameraMode === "enabled" ? (
              <>
                <Video size={13} className="text-[#10B981]" />
                <span>Camera enabled</span>
              </>
            ) : (
              <>
                <VideoOff size={13} className="text-[#7D7971]" />
                <span>Audio only</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 7. Text Answer Mode UI */}
      {isTextMode ? (
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#15171A]">Write your answer</label>
            <span className="font-mono text-[11px] text-[#7D7971]">
              {textAnswer.trim().split(/\s+/).filter(Boolean).length} words · {textAnswer.length} chars
            </span>
          </div>

          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            rows={6}
            placeholder="Type your structured answer here... State your approach, explain the technical mechanics, and consider edge cases and trade-offs."
            className="w-full p-3 rounded-xl border border-[#DDD7CB] bg-[#FAF8F5] text-xs text-[#15171A] focus:outline-none focus:ring-1 focus:ring-[#15171A] font-sans leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#7D7971]">
              Tip: Press Submit when ready for deep rubric evaluation.
            </span>

            <button
              type="button"
              disabled={textAnswer.trim().length < 5}
              onClick={() => onSubmitTextAnswer && onSubmitTextAnswer(textAnswer)}
              className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition hover:scale-102"
            >
              <span>Submit Answer</span>
              <Play size={12} className="fill-current" />
            </button>
          </div>
        </div>
      ) : (
        /* 8. Spoken Answer Action Strip */
        <div className="pt-2 border-t border-[#DDD7CB]/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* 30 sec Prepare Button */}
            <button
              type="button"
              onClick={onStartPrepare}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#15171A] text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
            >
              <Timer size={13} className="text-[#786D9D]" />
              <span>30 sec Prepare</span>
            </button>

            {/* Start Answer Button */}
            <button
              type="button"
              onClick={onStartRecord}
              className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition hover:scale-102"
            >
              <Play size={13} className="fill-current text-white" />
              <span>Start Answer</span>
            </button>

            {/* Skip Question Button */}
            {onSkipQuestion && (
              <button
                type="button"
                onClick={onSkipQuestion}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#7D7971] hover:text-[#15171A] hover:bg-white/60 transition cursor-pointer flex items-center gap-1.5"
              >
                <SkipForward size={13} />
                <span>Skip</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
