import React from "react";
import { Camera, Mic, Activity, Layers, Clock, ArrowRight, ExternalLink } from "lucide-react";

interface RecentItem {
  id: string;
  type: "image" | "voice" | "body" | "fusion";
  title: string;
  timestamp: string;
  confidence: number;
  signalQuality: string;
  context: string;
  vibe: string;
  emotion: string;
  fileUrl?: string;
}

interface RecentActivityListProps {
  items: RecentItem[];
  onNavigate: (path: string) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ items, onNavigate }) => {
  const getModalityIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Camera size={13} className="text-[#3B82F6]" />;
      case "voice":
        return <Mic size={13} className="text-[#10B981]" />;
      case "body":
        return <Activity size={13} className="text-[#F59E0B]" />;
      case "fusion":
        return <Layers size={13} className="text-[#A855F7]" />;
      default:
        return <Activity size={13} />;
    }
  };

  const formatTimestamp = (raw: string) => {
    try {
      const d = new Date(raw);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
    } catch {
      return { date: "Recent", time: "" };
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Recent Session Activity
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Chronological audit of your latest recorded sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("/history")}
          className="text-xs text-[#15171A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Archive</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8C8983]">
          No recent analysis activity found.
        </div>
      ) : (
        <div className="divide-y divide-[#F0EDE6]">
          {items.map((item) => {
            const { date, time } = formatTimestamp(item.timestamp);

            return (
              <div
                key={item.id}
                onClick={() => onNavigate("/history")}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] -mx-2 px-2 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-center shrink-0">
                    {getModalityIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD7CB] text-[#15171A]">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-[#15171A] truncate group-hover:text-[#10B981] transition">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#707582] truncate mt-0.5 font-mono">
                      {date} · {time} • {item.context || "Standard session"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#10B981] block">
                      {item.confidence}%
                    </span>
                    <span className="text-[10px] text-[#8C8983] block">
                      {item.signalQuality} quality
                    </span>
                  </div>
                  <ExternalLink size={13} className="text-[#8C8983] group-hover:text-[#15171A] transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
