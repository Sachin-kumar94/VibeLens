import React, { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Camera, Mic, Activity, Layers, Sparkles } from "lucide-react";

interface OnboardingPageProps {
  onNavigate: (path: string) => void;
  userName?: string;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate, userName = "Sachin" }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      tag: "Philosophy",
      title: `Welcome, ${userName}.`,
      subtitle: "A thoughtful digital product about understanding people.",
      description: "VibeLens is designed to keep technology quietly in the background while placing human nuance, authentic emotion, and presence at the center.",
      image: "/assets/editorial/hero-natural-person.jpg",
      highlight: "Quiet Technology · Zero Biometric Surveillance",
    },
    {
      step: 2,
      tag: "Visual Signal",
      title: "Observe Visual Expressions.",
      subtitle: "Beyond pixels: facial micro-expressions and context.",
      description: "Learn to detect genuine Duchenne eye crinkles, relaxed brow geometry, and the ambient environment without synthetic AI filters.",
      image: "/assets/editorial/editorial-conversation.jpg",
      highlight: "Emotion Distribution · Color Psychology · Contextual Atmosphere",
    },
    {
      step: 3,
      tag: "Acoustic Signal",
      title: "Listen to Vocal Cadence.",
      subtitle: "Pacing, pitch stability, and vocal energy.",
      description: "Voice reveals what photos cannot. Monitor your natural speaking tempo (142 WPM) and diaphragmatic resonance across conversations.",
      image: "/assets/editorial/editorial-journal.jpg",
      highlight: "Acoustic Waveforms · Jitter Stability · Speaking Speed WPM",
    },
    {
      step: 4,
      tag: "Kinesic Signal",
      title: "Align Bodily Posture.",
      subtitle: "Spinal openness, eye contact, and presence.",
      description: "Observe physical ease—comfortable 88° spine alignment, unhurried gaze cadence, and receptive shoulder orientations.",
      image: "/assets/editorial/editorial-posture.jpg",
      highlight: "Ergonomic Alignment · Attentive Lean · Micro-Movement Stability",
    },
    {
      step: 5,
      tag: "Multimodal Synthesis",
      title: "Unlock Multimodal Fusion.",
      subtitle: "Where multiple human channels become one cohesive reading.",
      description: "When visual, vocal, and bodily cues harmonize, VibeLens produces a unified confidence score and consistency evaluation.",
      image: "/assets/editorial/editorial-conversation.jpg",
      highlight: "Harmonious Concordance (91%) · Grounded Self-Reflection",
    },
  ];

  const activeStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate("/dashboard");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#15171A] flex flex-col justify-between selection:bg-[#DDD7CB]">
      {/* Top Bar */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-[#E6E1D6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#15171A] text-[#F6F3EC] flex items-center justify-center font-serif font-bold text-sm">
            V
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#15171A]">
            VibeLens
          </span>
        </div>

        {/* Step Counter: 1 / 5 */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#81827D]">
            Step <strong className="text-[#15171A]">{currentStep}</strong> of 5
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-[#15171A]"
                    : i < currentStep
                    ? "w-2 bg-[#748D76]"
                    : "w-2 bg-[#DDD7CB]"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1240px] w-full mx-auto px-6 py-12 my-auto">
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-8 sm:p-12 shadow-[0_2px_16px_rgba(21,23,26,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Explanatory Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6F3EC] border border-[#DDD7CB] text-[11px] font-mono text-[#71889C] font-semibold">
              <span>{activeStepData.tag}</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#15171A] tracking-tight">
                {activeStepData.title}
              </h2>
              <p className="text-base text-[#71889C] font-medium">
                {activeStepData.subtitle}
              </p>
            </div>

            <p className="text-sm text-[#81827D] leading-relaxed max-w-lg">
              {activeStepData.description}
            </p>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D6] flex items-center gap-3 text-xs text-[#15171A]">
              <CheckCircle2 size={16} className="text-[#748D76] shrink-0" />
              <span className="font-mono text-[11px]">{activeStepData.highlight}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-3 rounded-full border border-[#DDD7CB] hover:bg-[#F6F3EC] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-full bg-[#15171A] hover:bg-[#292C2F] text-[#F6F3EC] text-xs font-semibold tracking-tight shadow-sm hover:shadow transition cursor-pointer flex items-center gap-2"
              >
                <span>{currentStep === 5 ? "Enter Dashboard" : "Continue"}</span>
                <ArrowRight size={14} />
              </button>

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => onNavigate("/dashboard")}
                  className="text-xs text-[#81827D] hover:text-[#15171A] transition cursor-pointer ml-auto"
                >
                  Skip Onboarding
                </button>
              )}
            </div>
          </div>

          {/* Right: Specimen Illustration/Photo */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-xl overflow-hidden border border-[#E6E1D6] bg-[#EFE9DE] shadow-xs">
              <img
                src={activeStepData.image}
                alt={activeStepData.title}
                className="w-full h-auto max-h-[380px] object-cover filter contrast-[101%]"
              />
            </div>
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono text-[#15171A] border border-[#DDD7CB]">
              Step {currentStep} Specimen
            </div>
          </div>

        </div>
      </div>

      <footer className="py-6 text-center text-[11px] font-mono text-[#81827D] border-t border-[#E6E1D6]">
        VibeLens Initial Calibration
      </footer>
    </div>
  );
};
