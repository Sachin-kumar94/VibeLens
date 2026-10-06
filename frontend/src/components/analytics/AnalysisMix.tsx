import React from "react";
import { Camera, Mic, Activity, Layers, ArrowRight } from "lucide-react";

interface ModalityItem {
  type: "image" | "voice" | "body" | "fusion" | "interview" | "presentation" | string;
  count: number;
  percentage: number;
  averageConfidence: number | null;
}

interface AnalysisMixProps {
  mix: ModalityItem[];
  total: number;
  onNavigate: (path: string) => void;
}

export const AnalysisMix: React.FC<AnalysisMixProps> = ({ mix, total, onNavigate }) => {
  const getModalityMeta = (type: string) => {
    switch (type) {
      case "image":
        return {
          label: "Image Analysis",
          icon: <Camera size={14} className="text-[#3B82F6]" />,
          bgIcon: "bg-[#EFF6FF]",
          path: "/image",
        };
      case "voice":
        return {
          label: "Voice Prosody",
          icon: <Mic size={14} className="text-[#10B981]" />,
          bgIcon: "bg-[#E6F4EA]",
          path: "/voice",
        };
      case "body":
        return {
          label: "Body Kinesics",
          icon: <Activity size={14} className="text-[#F59E0B]" />,
          bgIcon: "bg-[#FEF3C7]",
          path: "/body",
        };
      case "fusion":
        return {
          label: "Multimodal Fusion",
          icon: <Layers size={14} className="text-[#A855F7]" />,
          bgIcon: "bg-[#F3E8FF]",
          path: "/fusion",
        };
      case "interview":
        return {
          label: "Interview Practice",
          icon: <Activity size={14} className="text-[#C18A69]" />,
          bgIcon: "bg-[#FFF7ED]",
          path: "/interview",
        };
      default:
        return {
          label: type,
          icon: <Activity size={14} />,
          bgIcon: "bg-gray-100",
          path: "/fusion",
        };
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EDE6]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Analysis Mix & Modality Performance
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Channel distribution and average confidence across capture modes.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#8C8983] uppercase">
          Cross-Modal Balance
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {mix.map((item) => {
          const meta = getModalityMeta(item.type);
          const hasSessions = item.count > 0;

          return (
            <div
              key={item.type}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${meta.bgIcon} border border-[#DDD7CB]/60 flex items-center justify-center shrink-0`}
                  >
                    {meta.icon}
                  </div>
                  <span className="text-xs font-bold text-[#15171A]">
                    {meta.label}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-[#15171A]">
                  {item.count} <span className="text-[#8C8983] font-normal">({item.percentage}%)</span>
                </span>
              </div>

              <div className="pt-2 border-t border-[#DDD7CB]/60 flex items-center justify-between text-[11px]">
                {hasSessions ? (
                  <>
                    <span className="text-[#575A60]">Avg. Confidence:</span>
                    <span className="font-mono font-bold text-[#10B981]">
                      {item.averageConfidence}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[#8C8983] italic">No {item.type} sessions yet</span>
                    <button
                      type="button"
                      onClick={() => onNavigate(meta.path)}
                      className="text-[10px] font-semibold text-[#15171A] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Record {item.type}</span>
                      <ArrowRight size={10} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
