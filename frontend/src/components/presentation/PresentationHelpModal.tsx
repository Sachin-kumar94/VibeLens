import React from "react";
import {
  X,
  Camera,
  Mic,
  Activity,
  Lock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface PresentationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationHelpModal: React.FC<PresentationHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#DDD7CB] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD7CB] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#DDD7CB] flex items-center justify-center text-[#15171A]">
              <HelpCircle size={16} />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#15171A]">
                Presentation Coach Setup & Guidance
              </h2>
              <p className="text-xs text-[#575A60]">
                Best practices for camera, microphone, and rehearsal feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-[#575A60]">
          {/* 1. Camera Setup */}
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
            <div className="flex items-center gap-2 font-semibold text-[#15171A]">
              <Camera size={15} className="text-[#10B981]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Camera Setup</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-[#575A60]">
              <li><strong>Eye Level:</strong> Place the camera around eye level so your gaze faces forward naturally.</li>
              <li><strong>Framing:</strong> Keep your head and upper torso centered in the frame. Avoid sitting too close or too far away.</li>
              <li><strong>Lighting:</strong> Ensure soft, front-facing light on your face. Avoid having strong backlights or windows directly behind you.</li>
            </ul>
          </div>

          {/* 2. Microphone Setup */}
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
            <div className="flex items-center gap-2 font-semibold text-[#15171A]">
              <Mic size={15} className="text-[#3B82F6]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Microphone Setup</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-[#575A60]">
              <li><strong>Natural Volume:</strong> Speak at your standard conversational presentation volume.</li>
              <li><strong>Avoid Obstructions:</strong> Ensure your laptop or headset microphone is uncovered and free from desk vibrations.</li>
              <li><strong>Background Noise:</strong> Minimize background music, echo, or ambient conversational noise for optimal pace measurement.</li>
            </ul>
          </div>

          {/* 3. How Feedback Works */}
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
            <div className="flex items-center gap-2 font-semibold text-[#15171A]">
              <Activity size={15} className="text-[#8B5CF6]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">How Feedback Works</span>
            </div>
            <p className="leading-relaxed">
              Feedback uses available audio and video signals captured locally from your rehearsal.
              Pacing is calculated from real speech-to-text transcript cadence, pauses are timed via Web Audio energy drops,
              and posture stability is derived from upper-body landmark symmetry.
            </p>
          </div>

          {/* 4. Privacy & Recording Ownership */}
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
            <div className="flex items-center gap-2 font-semibold text-[#15171A]">
              <Lock size={15} className="text-[#10B981]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Your Privacy</span>
            </div>
            <p className="leading-relaxed">
              Camera and microphone are active <strong>only</strong> during the active rehearsal session.
              You maintain complete control over whether the video and audio recording are saved to your account,
              or if only the numerical analysis is preserved.
            </p>
          </div>

          {/* 5. Assistance Signals */}
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
            <div className="flex items-center gap-2 font-semibold text-[#15171A]">
              <ShieldCheck size={15} className="text-[#575A60]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Assistance Signals</span>
            </div>
            <p className="leading-relaxed">
              Browser signals (like tab switching or temporary window blur) are logged strictly as observable context for signal quality.
              VibeLens does not make speculative claims regarding cheating or AI-generated answers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DDD7CB] bg-[#FAF8F5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
