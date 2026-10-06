import React from "react";
import { CheckCircle2, TrendingUp, Presentation, UserCheck, AlertCircle, Lightbulb } from "lucide-react";

interface CoachData {
  whatWentWell: string[];
  whatToImprove: string[];
  recommendations: string[];
  presentationAdvice: string;
  interviewAdvice: string;
}

interface CommunicationCoachProps {
  coach: CoachData;
}

export const CommunicationCoach: React.FC<CommunicationCoachProps> = ({ coach }) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2.5">
        <h4 className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
          <TrendingUp size={14} className="text-[#10B981]" />
          <span>Communication Coaching</span>
        </h4>
        <span className="text-[10px] text-[#8C8983] font-mono">Personalized Insights</span>
      </div>

      {/* Grid: What went well & What to improve */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* What went well */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-2">
          <span className="font-bold text-[#166534] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <CheckCircle2 size={13} className="text-[#10B981]" />
            What Went Well
          </span>
          <ul className="space-y-1.5 text-[#14532D]">
            {coach.whatWentWell.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What to improve */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] space-y-2">
          <span className="font-bold text-[#92400E] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Lightbulb size={13} className="text-[#F59E0B]" />
            Opportunities for Growth
          </span>
          <ul className="space-y-1.5 text-[#78350F]">
            {coach.whatToImprove.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mode Specific Coaching */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Presentation Mode */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#15171A]">
            <Presentation size={14} className="text-[#3B82F6]" />
            <span>Presentation Delivery Tip</span>
          </div>
          <p className="text-[11px] text-[#575A60] leading-relaxed">
            {coach.presentationAdvice}
          </p>
        </div>

        {/* Interview Mode */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#15171A]">
            <UserCheck size={14} className="text-[#A855F7]" />
            <span>Interview Cadence Coaching</span>
          </div>
          <p className="text-[11px] text-[#575A60] leading-relaxed">
            {coach.interviewAdvice}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 text-[10px] text-[#8C8983] leading-normal pt-1">
        <AlertCircle size={11} className="shrink-0 mt-0.5 text-[#8C8983]" />
        <span>
          Coaching feedback is provided for personal speaking practice and presentation skill enhancement only.
        </span>
      </div>
    </div>
  );
};
