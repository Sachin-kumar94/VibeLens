import React, { useState } from "react";
import { FileText, Copy, Check, Play, MessageSquare, AlertCircle } from "lucide-react";

interface TranscriptSentence {
  start: string;
  seconds: number;
  text: string;
  signal: string;
}

interface FillerWordsDetail {
  count: number;
  ratePerMinute: number;
  words: { word: string; count: number }[];
}

interface TranscriptPanelProps {
  transcript?: {
    fullText: string;
    sentences: TranscriptSentence[];
  };
  fillerWords?: FillerWordsDetail;
  onSeek?: (seconds: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  fillerWords,
  onSeek,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  if (!transcript || !transcript.sentences || transcript.sentences.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] text-center space-y-2 text-xs text-[#707582]">
        <FileText size={20} className="mx-auto text-[#8C8983]" />
        <p className="font-medium text-[#15171A]">No spoken transcript available</p>
        <p className="text-[11px]">
          Speech-to-text operates on recordings with audible consonant and vowel articulation.
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const filteredSentences = transcript.sentences.filter((s) =>
    s.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-4 text-xs">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DA] pb-3">
        <div>
          <h4 className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
            <FileText size={14} className="text-[#15171A]" />
            <span>Spoken Transcript & Signals</span>
          </h4>
          <span className="text-[10px] text-[#8C8983]">
            Click any sentence to jump the audio preview to that timestamp.
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#F4F1EA] text-[#15171A] font-semibold text-[11px] transition flex items-center gap-1.5 self-start cursor-pointer"
        >
          {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy Transcript"}</span>
        </button>
      </div>

      {/* Filler Words Metric Banner */}
      {fillerWords && (
        <div className="p-3.5 rounded-xl bg-white border border-[#E8E4DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="font-bold text-[#15171A] block">Filler Words Analysis</span>
            <span className="text-[11px] text-[#707582]">
              Detected pauses filled with hesitation tokens
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-mono font-bold text-sm text-[#15171A]">
                {fillerWords.count}
              </span>
              <span className="text-[10px] text-[#8C8983] block">
                {fillerWords.ratePerMinute}/min
              </span>
            </div>

            {fillerWords.words.length > 0 && (
              <div className="flex items-center gap-1">
                {fillerWords.words.map((fw) => (
                  <span
                    key={fw.word}
                    className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#DDD8CD] font-mono text-[10px] text-[#575A60]"
                  >
                    &ldquo;{fw.word}&rdquo; ({fw.count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sentence list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredSentences.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSeek && onSeek(s.seconds)}
            className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] hover:border-[#15171A] hover:bg-white transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[11px] text-[#15171A] flex items-center gap-1 group-hover:text-[#10B981]">
                <Play size={10} className="fill-current text-[#10B981]" />
                {s.start}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#E8E4DA] text-[10px] font-mono text-[#707582]">
                {s.signal}
              </span>
            </div>
            <p className="text-xs text-[#15171A] leading-relaxed group-hover:text-black">
              &ldquo;{s.text}&rdquo;
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
