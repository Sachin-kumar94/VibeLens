import React from "react";
import {
  User,
  Briefcase,
  Layers,
  BarChart2,
  ListOrdered,
  Camera,
  Mic,
  Wifi,
  Play,
  Settings,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface InterviewLobbyProps {
  candidateName: string;
  role: string;
  interviewType: string;
  difficulty: string;
  questionCount: number;
  cameraMode: "enabled" | "audio_only";
  onStartInterview: () => void;
  onOpenSettings: () => void;
  onRecheckDevices: () => void;
}

export const InterviewLobby: React.FC<InterviewLobbyProps> = ({
  candidateName,
  role,
  interviewType,
  difficulty,
  questionCount,
  cameraMode,
  onStartInterview,
  onOpenSettings,
  onRecheckDevices,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-8 animate-fade-in">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 shadow-sm space-y-8">
        {/* Badge & Title */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#525E50]/10 text-[#525E50] text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#525E50] animate-pulse" />
            <span>Interview Ready · Practice Room Lobby</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-[#15171A]">
            Executive Simulation Stage
          </h2>
          <p className="text-sm text-[#73716B] leading-relaxed max-w-lg">
            Your simulation parameters and hardware links are verified. Once started, questions will be presented one by one with structured preparation intervals.
          </p>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-[#E5E0D8] py-6">
          <div className="space-y-3.5">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Candidate</span>
                <span className="font-medium text-[#15171A]">{candidateName || "Candidate"}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Target Role</span>
                <span className="font-medium text-[#15171A]">{role}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Interview Track</span>
                <span className="font-medium text-[#15171A]">{interviewType}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Difficulty Tier</span>
                <span className="font-medium text-[#15171A]">{difficulty}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Question Quota</span>
                <span className="font-medium text-[#15171A]">{questionCount} Prompts</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#73716B]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A3A099] uppercase tracking-wider">Privacy & Storage</span>
                <span className="font-medium text-[#15171A]">Practice Mode (Local/Secure)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Badges */}
        <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera: {cameraMode === "audio_only" ? "Disabled (Audio Mode)" : "Ready"}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <Mic className="w-3.5 h-3.5" />
              <span>Microphone: Ready</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              <span>Network: Connected</span>
            </div>
          </div>
          <button
            onClick={onRecheckDevices}
            className="text-[11px] text-[#73716B] hover:text-[#15171A] underline underline-offset-2 transition-colors"
          >
            Re-test hardware
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white text-xs font-semibold text-[#73716B] hover:text-[#15171A] hover:bg-[#FAF8F5] transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Customize Setup</span>
          </button>

          <button
            onClick={onStartInterview}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#525E50] hover:bg-[#434E41] text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Start Interview</span>
            <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
