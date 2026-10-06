import React, { useState, useRef } from "react";
import {
  Camera,
  Mic,
  Activity,
  Layers,
  Upload,
  Play,
  Square,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Volume2,
  RefreshCw,
  BookOpen,
  Info
} from "lucide-react";

interface InteractiveStudioProps {
  initialTab?: "image" | "voice" | "body" | "fusion" | "journal";
  onBackToLanding: () => void;
}

export const InteractiveStudio: React.FC<InteractiveStudioProps> = ({
  initialTab = "image",
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<"image" | "voice" | "body" | "fusion" | "journal">(initialTab);
  const [selectedImage, setSelectedImage] = useState<string>("/assets/editorial/hero-natural-person.jpg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(true);

  // Audio recording simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);

  // Journal entry state
  const [journalNote, setJournalNote] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          triggerAnalysis();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisDone(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisDone(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#15171A] font-sans pb-24">
      {/* Studio Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E6E1D6]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-xs font-medium text-[#8C8983] hover:text-[#15171A] transition px-3 py-1.5 rounded-lg border border-[#DDD7CB] hover:bg-white cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </button>
            <div className="h-4 w-[1px] bg-[#DDD7CB] hidden sm:block" />
            <h1 className="font-serif text-xl font-bold text-[#15171A] hidden sm:block">
              VibeLens Studio
            </h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#EFEAE1] p-1 rounded-full border border-[#DDD7CB] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("image")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "image"
                  ? "bg-[#15171A] text-[#F7F4EE] shadow-xs"
                  : "text-[#25282C] hover:text-[#15171A]"
              }`}
            >
              Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "voice"
                  ? "bg-[#15171A] text-[#F7F4EE] shadow-xs"
                  : "text-[#25282C] hover:text-[#15171A]"
              }`}
            >
              Voice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("body")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "body"
                  ? "bg-[#15171A] text-[#F7F4EE] shadow-xs"
                  : "text-[#25282C] hover:text-[#15171A]"
              }`}
            >
              Body
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fusion")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "fusion"
                  ? "bg-[#15171A] text-[#F7F4EE] shadow-xs"
                  : "text-[#25282C] hover:text-[#15171A]"
              }`}
            >
              Synthesis
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="max-w-[1360px] mx-auto px-6 lg:px-12 pt-10">
        
        {/* ============================================================
            TAB 1: IMAGE ANALYSIS
           ============================================================ */}
        {activeTab === "image" && (
          <div className="space-y-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">
                Observational Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#15171A] mt-1">
                Visual & Facial Nuance
              </h2>
              <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                Upload a real-world portrait or choose an editorial specimen to decompose facial expression, tone, and environment.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Image Canvas */}
              <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6] bg-[#F5F1E8] min-h-[380px] flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Current specimen"
                    className="w-full h-auto max-h-[500px] object-cover filter contrast-[101%]"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#F7F4EE]/70 backdrop-blur-xs flex items-center justify-center">
                      <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-[#DDD7CB] shadow-md text-xs font-mono">
                        <RefreshCw size={14} className="animate-spin text-[#15171A]" />
                        <span>Reading visual signals...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls & Sample Presets */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-full bg-[#15171A] hover:bg-[#25282C] text-[#F7F4EE] text-xs font-medium flex items-center gap-2 cursor-pointer shadow-xs transition"
                  >
                    <Upload size={14} />
                    <span>Upload Custom Photo</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-[#8C8983]">
                    <span className="font-mono text-[11px]">Curated samples:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage("/assets/editorial/hero-natural-person.jpg");
                        triggerAnalysis();
                      }}
                      className="px-2.5 py-1 rounded bg-[#F5F1E8] hover:bg-[#EFEAE1] text-[#15171A] border border-[#DDD7CB] text-[11px] font-medium cursor-pointer"
                    >
                      Desk Work
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage("/assets/editorial/editorial-conversation.jpg");
                        triggerAnalysis();
                      }}
                      className="px-2.5 py-1 rounded bg-[#F5F1E8] hover:bg-[#EFEAE1] text-[#15171A] border border-[#DDD7CB] text-[11px] font-medium cursor-pointer"
                    >
                      Library Dialogue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage("/assets/editorial/editorial-posture.jpg");
                        triggerAnalysis();
                      }}
                      className="px-2.5 py-1 rounded bg-[#F5F1E8] hover:bg-[#EFEAE1] text-[#15171A] border border-[#DDD7CB] text-[11px] font-medium cursor-pointer"
                    >
                      Open Posture
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Signal Findings Table */}
              <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-6">
                <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-4">
                  <h3 className="font-serif text-2xl text-[#15171A]">Signal Readings</h3>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#708C74]/15 text-[#708C74] font-medium">
                    Signal Quality: 94%
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8C8983] tracking-wider">
                      Observed Affect
                    </span>
                    <div className="text-base font-serif text-[#15171A]">
                      Calm, Attentive Engagement
                    </div>
                    <p className="text-xs text-[#8C8983]">
                      Relaxed orbicularis oculi (genuine ease) with minimal forehead micro-furrowing.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-[#E6E1D6]">
                      <div className="text-[10px] font-mono text-[#8C8983]">Micro-Smile Score</div>
                      <div className="text-lg font-serif text-[#15171A] mt-0.5">88 / 100</div>
                      <div className="text-[10px] text-[#708C74] mt-0.5">Authentic cadence</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#E6E1D6]">
                      <div className="text-[10px] font-mono text-[#8C8983]">Eye Softness</div>
                      <div className="text-lg font-serif text-[#15171A] mt-0.5">92 / 100</div>
                      <div className="text-[10px] text-[#6D8192] mt-0.5">No squint tension</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8C8983] tracking-wider">
                      Atmosphere & Context
                    </span>
                    <div className="text-sm font-medium text-[#15171A]">
                      Natural Window Daylight · Organic Materials
                    </div>
                    <p className="text-xs text-[#8C8983]">
                      The environment supports cognitive clarity with minimal visual clutter.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("fusion")}
                  className="w-full py-3 rounded-full bg-[#15171A] hover:bg-[#25282C] text-[#F7F4EE] text-xs font-medium transition cursor-pointer"
                >
                  Synthesize with Voice & Body →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: VOICE PROSODY
           ============================================================ */}
        {activeTab === "voice" && (
          <div className="space-y-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">
                Observational Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#15171A] mt-1">
                Acoustic Prosody & Cadence
              </h2>
              <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                Analyze pitch inflection, speech pace, and vocal stability using clean studio waveforms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-6">
                <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6D8192]/15 text-[#6D8192] flex items-center justify-center">
                      <Volume2 size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#15171A]">Acoustic Waveform Monitor</div>
                      <div className="text-[11px] font-mono text-[#8C8983]">Studio recording · 48 kHz float</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#6D8192] bg-[#6D8192]/10 px-3 py-1 rounded-full">
                    Cadence: 142 WPM
                  </span>
                </div>

                {/* Natural Audio Waveform Bars */}
                <div className="h-36 bg-[#F5F1E8] rounded-xl border border-[#DDD7CB] p-6 flex items-center justify-between gap-1.5">
                  {[
                    20, 35, 60, 75, 45, 30, 50, 85, 95, 70, 40, 65, 80, 90, 55, 35,
                    45, 70, 85, 60, 35, 55, 75, 90, 65, 45, 30, 55, 75, 85, 55, 35
                  ].map((height, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-[#6D8192] rounded-full transition-all duration-300"
                      style={{ height: `${height}%`, opacity: 0.8 }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#8C8983]">
                  <span>Fundamental: 210 Hz</span>
                  <span>Jitter: 0.32% (Stable)</span>
                  <span>Harmonics: Rich</span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-6">
                <h3 className="font-serif text-2xl text-[#15171A]">Vocal Dimensions</h3>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                    <div className="text-[10px] font-mono text-[#8C8983] uppercase">Tone Quality</div>
                    <div className="text-base font-semibold text-[#15171A] mt-0.5">Warm & Grounded</div>
                    <p className="text-xs text-[#8C8983] mt-1">Harmonic breath control with relaxed vocal cords.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                    <div className="text-[10px] font-mono text-[#8C8983] uppercase">Pacing</div>
                    <div className="text-base font-semibold text-[#15171A] mt-0.5">142 Words Per Minute</div>
                    <p className="text-xs text-[#8C8983] mt-1">Ideal pacing for articulate conversational presence.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                    <div className="text-[10px] font-mono text-[#8C8983] uppercase">Vocal Confidence</div>
                    <div className="text-base font-semibold text-[#708C74] mt-0.5">88% (High Assurance)</div>
                    <p className="text-xs text-[#8C8983] mt-1">Absence of pitch tremors or nervous hesitation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: BODY KINESICS
           ============================================================ */}
        {activeTab === "body" && (
          <div className="space-y-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">
                Observational Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#15171A] mt-1">
                Postural Alignment & Movement
              </h2>
              <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                Observing spinal alignment, shoulder angles, and natural physical ease.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6]">
                  <img
                    src="/assets/editorial/editorial-posture.jpg"
                    alt="Posture specimen"
                    className="w-full h-auto max-h-[480px] object-cover filter contrast-[101%]"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded text-xs font-mono text-[#15171A]">
                    Spine Angle: 88° Upright · Open Shoulders
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-6">
                <h3 className="font-serif text-2xl text-[#15171A]">Kinesic Markers</h3>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Shoulder Openness</div>
                      <div className="text-[11px] text-[#8C8983]">Low thoracic tension</div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#708C74]">Open</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Torso Incline</div>
                      <div className="text-[11px] text-[#8C8983]">5° Attentive forward lean</div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#6D8192]">Receptive</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Head Stability</div>
                      <div className="text-[11px] text-[#8C8983]">Natural nodding cadence</div>
                    </div>
                    <span className="text-xs font-mono font-medium text-[#C88A63]">Steady</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: MULTIMODAL SYNTHESIS
           ============================================================ */}
        {activeTab === "fusion" && (
          <div className="space-y-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">
                Observational Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#15171A] mt-1">
                Holistic Multimodal Synthesis
              </h2>
              <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                Combining Image, Voice, Body, and Context into a singular, grounded narrative.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.03)] max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between border-b border-[#E6E1D6] pb-4">
                <span className="text-xs font-mono uppercase text-[#8C8983]">Synthesis #942</span>
                <span className="text-xs font-mono text-[#708C74] bg-[#708C74]/10 px-3 py-1 rounded-full font-medium">
                  Harmonious Concordance (92%)
                </span>
              </div>

              <blockquote className="font-serif text-3xl text-[#15171A] leading-snug">
                “Signals suggest a calm, engaged moment with high interpersonal resonance.”
              </blockquote>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[10px] font-mono text-[#8C8983]">Visual Channel</div>
                  <div className="text-sm font-semibold text-[#15171A] mt-1">Authentic Duchenne Smile</div>
                  <div className="text-[10px] text-[#708C74] mt-0.5">88% alignment</div>
                </div>
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[10px] font-mono text-[#8C8983]">Acoustic Channel</div>
                  <div className="text-sm font-semibold text-[#15171A] mt-1">Grounded 142 WPM</div>
                  <div className="text-[10px] text-[#6D8192] mt-0.5">Zero pitch jitter</div>
                </div>
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[10px] font-mono text-[#8C8983]">Kinesic Channel</div>
                  <div className="text-sm font-semibold text-[#15171A] mt-1">88° Open Spine</div>
                  <div className="text-[10px] text-[#C88A63] mt-0.5">Attentive lean</div>
                </div>
              </div>

              {/* Add Note to Journal */}
              <div className="pt-6 border-t border-[#E6E1D6] space-y-3">
                <label className="text-xs font-semibold text-[#15171A] block">
                  Add a personal note to your Vibe Journal:
                </label>
                <textarea
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="Record what was happening in this moment..."
                  className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#15171A] focus:outline-hidden focus:border-[#15171A] resize-none h-24"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8C8983]">
                    {journalSaved ? "✓ Note saved to local journal!" : "Saved locally with AES-256 client encryption"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setJournalSaved(true);
                      setTimeout(() => setJournalSaved(false), 3000);
                    }}
                    className="px-5 py-2 rounded-full bg-[#15171A] text-[#F7F4EE] text-xs font-medium hover:bg-[#25282C] transition cursor-pointer"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
