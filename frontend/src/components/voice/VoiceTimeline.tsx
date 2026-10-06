import React from "react";
import { Clock, Play } from "lucide-react";

interface Milestone {
  timestamp: string;
  seconds: number;
  emotion: string;
  tone: string;
  note: string;
}

interface SpeechSegment {
  segment: number;
  timeRange: string;
  startSec: number;
  endSec: number;
  emotion: string;
  energy: "Low" | "Medium" | "High";
  paceWpm: number;
  note: string;
}

interface VoiceTimelineProps {
  timeline: Milestone[];
  segments: SpeechSegment[];
  onSeek?: (seconds: number) => void;
}

export const VoiceTimeline: React.FC<VoiceTimelineProps> = ({
  timeline,
  segments,
  onSeek,
}) => {
  return (
    <div className="space-y-5 text-xs">
      {/* 1. Cadence Milestones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
            <Clock size={13} className="text-[#15171A]" />
            <span>Voice Progression Timeline</span>
          </h4>
          <span className="text-[10px] text-[#8C8983] font-mono">Click to Jump</span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E4DA]">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative group">
              <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#15171A] group-hover:scale-125 transition-transform" />
              <button
                type="button"
                onClick={() => onSeek && onSeek(item.seconds)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] hover:border-[#15171A] hover:bg-white transition cursor-pointer space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#15171A] flex items-center gap-1.5">
                    <Play size={10} className="fill-current text-[#10B981]" />
                    {item.timestamp}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium text-[10px]">
                    {item.emotion}
                  </span>
                </div>
                <p className="text-[11px] text-[#575A60]">{item.note}</p>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Distinct Speech Segments */}
      {segments && segments.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-[#E8E4DA]">
          <h4 className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px]">
            Acoustic Speech Segments
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {segments.map((seg) => (
              <div
                key={seg.segment}
                className="p-3 rounded-xl bg-white border border-[#E8E4DA] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#15171A]">Segment {seg.segment}</span>
                  <span className="font-mono text-[10px] text-[#8C8983]">{seg.timeRange}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-[#10B981]">{seg.emotion}</span>
                  <span>•</span>
                  <span className="text-[#575A60]">{seg.paceWpm} WPM</span>
                  <span>•</span>
                  <span className="text-[#707582]">{seg.energy} Energy</span>
                </div>
                <p className="text-[10px] text-[#707582] leading-relaxed italic">{seg.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
