import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Bot,
} from "lucide-react";

interface InterviewerCardProps {
  questionText: string;
  category: string;
  interviewerStatus: "ASKING" | "LISTENING" | "PROCESSING" | "FOLLOW_UP" | "EVALUATING" | "IDLE";
  role?: string;
}

export const InterviewerCard: React.FC<InterviewerCardProps> = ({
  questionText,
  category,
  interviewerStatus,
  role = "Software Engineer",
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Derive contextual interviewer persona based on category & role
  const getInterviewerPersona = () => {
    if (category.includes("Leadership") || category.includes("Executive")) {
      return {
        name: "Dr. Jonathan Hayes",
        title: "VP of Engineering & Architecture",
        initials: "JH",
        accentColor: "bg-[#525E50]",
      };
    }
    if (category.includes("Product") || category.includes("Design")) {
      return {
        name: "Elena Rostova",
        title: "Staff Product Architect",
        initials: "ER",
        accentColor: "bg-[#6B5E7A]",
      };
    }
    if (category.includes("System") || category.includes("Technical")) {
      return {
        name: "Marcus Vance",
        title: "Principal Infrastructure Lead",
        initials: "MV",
        accentColor: "bg-[#4A5D6E]",
      };
    }
    return {
      name: "Claire Moreau",
      title: "Senior Technical Talent Partner",
      initials: "CM",
      accentColor: "bg-[#7A6452]",
    };
  };

  const persona = getInterviewerPersona();

  // Play question using Web Speech API (TTS)
  const speakQuestion = () => {
    if (textOnlyMode || isMuted || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.96; // Measured interview pacing
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
    }
  };

  const replayQuestion = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speakQuestion();
    }
  };

  const toggleMute = () => {
    if (isPlayingAudio && !isMuted) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    setIsMuted(!isMuted);
  };

  // Clean up speech synthesis on unmount or question change
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionText]);

  const getStatusBadge = () => {
    switch (interviewerStatus) {
      case "ASKING":
        return {
          label: "Presenting Question...",
          color: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500 animate-pulse",
        };
      case "LISTENING":
        return {
          label: "Listening to Answer...",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500 animate-pulse",
        };
      case "FOLLOW_UP":
        return {
          label: "Probing Follow-Up...",
          color: "bg-purple-50 text-purple-800 border-purple-200",
          dot: "bg-purple-500 animate-pulse",
        };
      case "PROCESSING":
      case "EVALUATING":
        return {
          label: "Synthesizing Evidence...",
          color: "bg-blue-50 text-blue-800 border-blue-200",
          dot: "bg-blue-500 animate-pulse",
        };
      default:
        return {
          label: "Ready for Delivery",
          color: "bg-[#FAF8F5] text-[#73716B] border-[#E5E0D8]",
          dot: "bg-[#73716B]",
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Interviewer Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-11 h-11 rounded-xl ${persona.accentColor} text-white font-serif font-semibold text-sm flex items-center justify-center shadow-inner`}
          >
            {persona.initials}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-serif font-semibold text-base text-[#15171A]">
                {persona.name}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#73716B] font-medium">
                Interviewer
              </span>
            </div>
            <p className="text-xs text-[#73716B]">{persona.title}</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Spoken Question Text Bubble */}
      <div className="relative bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-4.5 text-[#15171A] text-sm leading-relaxed font-sans">
        <div className="flex items-start space-x-2.5">
          <MessageSquare className="w-4 h-4 text-[#73716B] shrink-0 mt-0.5 opacity-70" />
          <p className="font-medium text-[#15171A]">{questionText}</p>
        </div>
      </div>

      {/* TTS Audio Controls */}
      <div className="flex items-center justify-between text-xs text-[#73716B] pt-1 border-t border-[#E5E0D8]/60">
        <div className="flex items-center space-x-2">
          {!isPlayingAudio ? (
            <button
              onClick={speakQuestion}
              className="px-2.5 py-1 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-[#15171A] font-medium flex items-center space-x-1.5 transition-colors"
              title="Play question audio"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Hear Question</span>
            </button>
          ) : (
            <button
              onClick={pauseSpeech}
              className="px-2.5 py-1 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] text-[#15171A] font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={replayQuestion}
            className="p-1.5 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-[#73716B] hover:text-[#15171A] transition-colors"
            title="Replay from start"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-[#73716B] hover:text-[#15171A] transition-colors"
            title={isMuted ? "Unmute voice" : "Mute voice"}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3" />}
          </button>
        </div>

        <button
          onClick={() => setTextOnlyMode(!textOnlyMode)}
          className={`text-[11px] underline underline-offset-2 transition-colors ${
            textOnlyMode ? "text-[#525E50] font-semibold" : "text-[#73716B] hover:text-[#15171A]"
          }`}
        >
          {textOnlyMode ? "Audio Disabled (Text Mode)" : "Prefer text only"}
        </button>
      </div>
    </div>
  );
};
