import React, { useState } from "react";
import { FileText, Copy, Check, Search, Edit3 } from "lucide-react";

interface InterviewTranscriptProps {
  transcript: string;
  wordCount: number;
  duration: number;
}

export const InterviewTranscript: React.FC<InterviewTranscriptProps> = ({
  transcript,
  wordCount,
  duration,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userNote, setUserNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-[#15171A] px-0.5 rounded-sm">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-4 shadow-2xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD7CB]/70 pb-3">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#71889C]" />
          <h4 className="text-sm font-bold text-[#15171A]">Spoken Answer Transcript</h4>
          <span className="text-[10px] font-mono text-[#7D7971] bg-white px-2 py-0.5 rounded-full border border-[#DDD7CB]">
            {wordCount} words · {Math.round(duration)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#DDD7CB] text-[#575A60] hover:text-[#15171A] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 size={11} />
            <span>{showNotes ? "Hide Notes" : "Add Self-Note"}</span>
          </button>

          {transcript && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#DDD7CB] text-[#575A60] hover:text-[#15171A] flex items-center gap-1 cursor-pointer transition hover:bg-[#FAF8F5]"
            >
              {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Search filter */}
      {transcript && transcript.length > 80 && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-[#8C8983]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords in your spoken answer..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
          />
        </div>
      )}

      {/* Main Transcript Display */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DDD7CB] text-xs leading-relaxed text-[#15171A] max-h-56 overflow-y-auto">
        {transcript ? (
          <p className="whitespace-pre-wrap">{highlightMatches(transcript, searchQuery)}</p>
        ) : (
          <p className="text-[#8C8983] italic">
            No spoken speech transcribed. Ensure your microphone is active and speak clearly during the answer capture window.
          </p>
        )}
      </div>

      {/* Self-Reflection Note Area */}
      {showNotes && (
        <div className="space-y-1.5 pt-2 animate-in fade-in">
          <label className="text-[11px] font-bold text-[#15171A]">Personal Rehearsal Note:</label>
          <textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Record what felt natural, what felt rushed, or specific technical terms you want to mention next time..."
            rows={2}
            className="w-full p-2.5 text-xs rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A] resize-none"
          />
        </div>
      )}
    </div>
  );
};
