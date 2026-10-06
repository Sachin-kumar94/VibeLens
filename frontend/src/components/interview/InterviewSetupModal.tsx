import React, { useState } from "react";
import {
  X,
  Play,
  Video,
  Mic,
  Sparkles,
  FileText,
  Briefcase,
  Award,
  Clock,
  Layers,
  BookOpen,
} from "lucide-react";

export const TARGET_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Engineer",
  "DevOps Engineer",
  "Product Engineer",
  "Executive Leadership",
  "Custom Role",
];

export const POSITIONS = [
  "Student / Intern",
  "Fresher / Entry Level",
  "Associate",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
];

export const EXPERIENCE_RANGES = [
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5–8 years",
  "8+ years",
];

export const INTERVIEW_TYPES = [
  "Behavioral",
  "Technical",
  "HR",
  "Project",
  "Leadership",
  "Product",
  "System Design",
  "Communication",
  "Problem Solving",
  "Mixed",
];

export const DIFFICULTIES = ["Easy", "Intermediate", "Advanced", "Expert"];

export interface InterviewSessionConfig {
  role: string;
  position: string;
  experienceRange: string;
  interviewType: string;
  difficulty: string;
  maxDifficulty: string;
  practiceMode?: "Interview" | "Practice" | "Study";
  learningMode?: "Interview" | "Practice" | "Study";
  questionSources: string[];
  questionCount: number;
  targetDuration: number;
  targetMin: number;
  targetMax: number;
  cameraMode: "enabled" | "audio_only";
  followUpsEnabled: boolean;
  adaptiveDifficulty: boolean;
  jobDescription?: string;
  resumeText?: string;
}

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: InterviewSessionConfig) => void;
  currentRole: string;
  currentType: string;
  currentDifficulty: string;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  currentRole,
  currentType,
  currentDifficulty,
}) => {
  const [role, setRole] = useState(currentRole || "Software Engineer");
  const [customRoleText, setCustomRoleText] = useState("");
  const [position, setPosition] = useState("Mid-Level");
  const [experienceRange, setExperienceRange] = useState("1–3 years");
  const [interviewType, setInterviewType] = useState(currentType || "Behavioral");
  const [difficulty, setDifficulty] = useState(currentDifficulty || "Intermediate");
  const [maxDifficulty, setMaxDifficulty] = useState("Expert");
  const [learningMode, setLearningMode] = useState<"Interview" | "Practice" | "Study">("Interview");
  const [questionCount, setQuestionCount] = useState(5);
  const [targetMin, setTargetMin] = useState(60);
  const [targetMax, setTargetMax] = useState(90);
  const [cameraMode, setCameraMode] = useState<"enabled" | "audio_only">("enabled");
  const [followUpsEnabled, setFollowUpsEnabled] = useState(true);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);

  // Question Sources (Section 22)
  const [useResume, setUseResume] = useState(true);
  const [useJd, setUseJd] = useState(true);
  const [useStudyMaterials, setUseStudyMaterials] = useState(true);
  const [useStandard, setUseStandard] = useState(true);

  if (!isOpen) return null;

  const handleStart = () => {
    const finalRole = role === "Custom Role" && customRoleText.trim() ? customRoleText.trim() : role;

    const sources: string[] = [];
    if (useResume) sources.push("RESUME");
    if (useJd) sources.push("JOB_DESCRIPTION");
    if (useStudyMaterials) sources.push("STUDY_MATERIAL");
    if (useStandard) sources.push("STANDARD");
    if (sources.length === 0) sources.push("STANDARD");

    onStartSession({
      role: finalRole,
      position,
      experienceRange,
      interviewType,
      difficulty,
      maxDifficulty,
      practiceMode: learningMode,
      learningMode,
      questionSources: sources,
      questionCount,
      targetDuration: 20 * 60,
      targetMin,
      targetMax,
      cameraMode,
      followUpsEnabled,
      adaptiveDifficulty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8C8983] hover:text-[#15171A] hover:bg-[#DDD7CB]/40 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7D7971]">
              Simulation Protocol
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A]">
            Interview Practice Setup
          </h2>
          <p className="text-xs text-[#575A60] mt-1">
            Configure your role, seniority, learning sources, and sensor modes before starting your rehearsal.
          </p>
        </div>

        {/* Form Body */}
        <div className="space-y-5">
          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#15171A] flex items-center gap-1.5">
              <Briefcase size={13} className="text-[#71889C]" />
              <span>Target Role</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                    role === r
                      ? "bg-[#15171A] text-white border-[#15171A]"
                      : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {role === "Custom Role" && (
              <input
                type="text"
                value={customRoleText}
                onChange={(e) => setCustomRoleText(e.target.value)}
                placeholder="Enter custom title (e.g. Solutions Architect)"
                className="w-full mt-2 px-3.5 py-2 text-xs rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              />
            )}
          </div>

          {/* Position / Seniority & Experience Range (Sections 25 & 26) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#15171A]">Position / Seniority</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#15171A]">Experience Range</label>
              <select
                value={experienceRange}
                onChange={(e) => setExperienceRange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              >
                {EXPERIENCE_RANGES.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interview Type (Section 28) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#15171A] flex items-center gap-1.5">
              <Award size={13} className="text-[#786D9D]" />
              <span>Interview Type</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInterviewType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    interviewType === t
                      ? "bg-[#15171A] text-white border-[#15171A]"
                      : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Mode (Sections 100, 101, 168) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#15171A]">Practice Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLearningMode("Interview")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  learningMode === "Interview"
                    ? "bg-[#15171A] text-white border-[#15171A] shadow-xs"
                    : "bg-white border-[#DDD7CB] text-[#15171A] hover:border-[#8C8983]"
                }`}
              >
                <div className="font-semibold text-xs">Interview Mode</div>
                <p className={`text-[10px] mt-1 leading-snug ${learningMode === "Interview" ? "text-white/80" : "text-[#575A60]"}`}>
                  Realistic simulation. Deep evaluation after submitting.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLearningMode("Practice")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  learningMode === "Practice"
                    ? "bg-[#15171A] text-white border-[#15171A] shadow-xs"
                    : "bg-white border-[#DDD7CB] text-[#15171A] hover:border-[#8C8983]"
                }`}
              >
                <div className="font-semibold text-xs">Practice Mode</div>
                <p className={`text-[10px] mt-1 leading-snug ${learningMode === "Practice" ? "text-white/80" : "text-[#575A60]"}`}>
                  Hints, concept reveals, and instant retry comparison.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLearningMode("Study")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  learningMode === "Study"
                    ? "bg-[#15171A] text-white border-[#15171A] shadow-xs"
                    : "bg-white border-[#DDD7CB] text-[#15171A] hover:border-[#8C8983]"
                }`}
              >
                <div className="font-semibold text-xs">Study Mode</div>
                <p className={`text-[10px] mt-1 leading-snug ${learningMode === "Study" ? "text-white/80" : "text-[#575A60]"}`}>
                  Step-by-step concept learning with source citations.
                </p>
              </button>
            </div>
          </div>

          {/* Question Sources Checkboxes (Section 22) */}
          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-2.5">
            <span className="text-xs font-bold text-[#15171A] flex items-center gap-1.5">
              <Layers size={13} className="text-[#10B981]" />
              <span>Question Sources</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                  className="rounded border-[#DDD7CB] text-[#15171A] focus:ring-0"
                />
                <span className="text-[#575A60]">Resume / CV</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useJd}
                  onChange={(e) => setUseJd(e.target.checked)}
                  className="rounded border-[#DDD7CB] text-[#15171A] focus:ring-0"
                />
                <span className="text-[#575A60]">Job Description</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useStudyMaterials}
                  onChange={(e) => setUseStudyMaterials(e.target.checked)}
                  className="rounded border-[#DDD7CB] text-[#15171A] focus:ring-0"
                />
                <span className="text-[#575A60]">Study Materials</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useStandard}
                  onChange={(e) => setUseStandard(e.target.checked)}
                  className="rounded border-[#DDD7CB] text-[#15171A] focus:ring-0"
                />
                <span className="text-[#575A60]">Standard Question Bank</span>
              </label>
            </div>
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#15171A]">Starting Difficulty</label>
              <div className="flex gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      difficulty === d
                        ? "bg-[#15171A] text-white border-[#15171A]"
                        : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#15171A]">Question Count</label>
              <div className="flex gap-1.5">
                {[3, 5, 8, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      questionCount === count
                        ? "bg-[#15171A] text-white border-[#15171A]"
                        : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Modality */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#15171A]">Sensor Modalities</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCameraMode("enabled")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  cameraMode === "enabled"
                    ? "bg-[#15171A] text-white border-[#15171A]"
                    : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                }`}
              >
                <Video size={16} className={cameraMode === "enabled" ? "text-[#10B981]" : "text-[#7D7971]"} />
                <div>
                  <span className="text-xs font-bold block">Camera + Microphone</span>
                  <span className="text-[10px] opacity-80 block">Visual presence & speech metrics</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCameraMode("audio_only")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  cameraMode === "audio_only"
                    ? "bg-[#15171A] text-white border-[#15171A]"
                    : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                }`}
              >
                <Mic size={16} className={cameraMode === "audio_only" ? "text-[#10B981]" : "text-[#7D7971]"} />
                <div>
                  <span className="text-xs font-bold block">Audio Only</span>
                  <span className="text-[10px] opacity-80 block">Vocal tone & speech cadence</span>
                </div>
              </button>
            </div>
          </div>

          {/* Adaptive Engine Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#15171A] block">Adaptive Difficulty (Section 68)</span>
                <span className="text-[10px] text-[#7D7971] block">
                  Gradually adapts question difficulty based on demonstrated skill mastery
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAdaptiveDifficulty(!adaptiveDifficulty)}
                className={`w-10 h-6 rounded-full transition p-0.5 cursor-pointer ${
                  adaptiveDifficulty ? "bg-[#10B981]" : "bg-[#DDD7CB]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    adaptiveDifficulty ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-[#DDD7CB]/50 pt-2.5">
              <div>
                <span className="text-xs font-bold text-[#15171A] block">Contextual Follow-ups (Section 64)</span>
                <span className="text-[10px] text-[#7D7971] block">
                  Interviewer probes deeper into your actual claims and missing trade-offs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpsEnabled(!followUpsEnabled)}
                className={`w-10 h-6 rounded-full transition p-0.5 cursor-pointer ${
                  followUpsEnabled ? "bg-[#10B981]" : "bg-[#DDD7CB]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    followUpsEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#DDD7CB] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#575A60] hover:text-[#15171A] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition hover:scale-102"
          >
            <Play size={13} className="fill-current" />
            <span>Start Practice Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
