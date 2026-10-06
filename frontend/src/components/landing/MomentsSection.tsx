import React, { useState } from "react";
import { Volume2, Mic, Activity, Eye, Compass, Sparkles } from "lucide-react";

export const MomentsSection: React.FC = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <section id="how-it-works" className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-20">
        
        {/* Section Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            See what makes a moment feel different.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Human communication is not a single stream. It is a layered composition
            of expression, vocal resonance, and bodily posture unfolding in unison.
          </p>
        </div>

        {/* ============================================================
            LAYOUT 1: IMAGE SECTION (Wide Photo + Editorial Side Annotations)
           ============================================================ */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-8 lg:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7">
              <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6]">
                <img
                  src="/assets/editorial/editorial-conversation.jpg"
                  alt="Two people in quiet conversation in a sunlit library"
                  className="w-full h-auto object-cover max-h-[460px] filter contrast-[101%] saturate-[95%]"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#DDD7CB] text-[11px] font-mono text-[#15171A]">
                  Signal A · Visual Expression
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-[#6D8192] tracking-wider">
                  Visual Layer
                </span>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Facial Nuance & Context
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed pt-1">
                  Gentle micro-expressions around the eyes and brow reveal ease rather than tension.
                </p>
              </div>

              {/* Minimal Editorial Annotation Table */}
              <div className="border-t border-[#E6E1D6] pt-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#F5F1E8]">
                  <span className="text-[#8C8983]">Expression</span>
                  <span className="font-medium text-[#15171A]">Authentic Duchenne smile</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#F5F1E8]">
                  <span className="text-[#8C8983]">Context</span>
                  <span className="font-medium text-[#15171A]">Daylit studio, one-on-one dialogue</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-[#F5F1E8]">
                  <span className="text-[#8C8983]">Color Atmosphere</span>
                  <span className="font-medium text-[#15171A]">Warm linen & natural oak tones</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#8C8983]">Observed Vibe</span>
                  <span className="font-medium text-[#708C74] bg-[#708C74]/10 px-2 py-0.5 rounded">
                    Receptive & Thoughtful
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================
            LAYOUT 2: VOICE SECTION (Studio Acoustic Waveform & Pacing)
           ============================================================ */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-8 lg:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-[#6D8192] tracking-wider">
                  Vocal Layer
                </span>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Acoustic Cadence & Tone
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed pt-1">
                  Voice reveals what images cannot: breath pacing, melodic pitch variance, and vocal confidence.
                </p>
              </div>

              {/* 4 Clean Metric Pillars in Muted Blue */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[11px] font-mono text-[#8C8983]">Tone</div>
                  <div className="text-base font-semibold text-[#15171A] mt-0.5">Warm & Grounded</div>
                  <div className="text-[11px] text-[#6D8192] mt-0.5">Harmonic pitch balance</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[11px] font-mono text-[#8C8983]">Energy</div>
                  <div className="text-base font-semibold text-[#15171A] mt-0.5">Moderate · 68%</div>
                  <div className="text-[11px] text-[#6D8192] mt-0.5">No vocal fatigue</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[11px] font-mono text-[#8C8983]">Pacing</div>
                  <div className="text-base font-semibold text-[#15171A] mt-0.5">142 WPM</div>
                  <div className="text-[11px] text-[#6D8192] mt-0.5">Ideal conversational flow</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                  <div className="text-[11px] font-mono text-[#8C8983]">Clarity</div>
                  <div className="text-base font-semibold text-[#15171A] mt-0.5">94% Stability</div>
                  <div className="text-[11px] text-[#708C74] mt-0.5">Zero jitter detected</div>
                </div>
              </div>
            </div>

            {/* Natural Audio Waveform Visualization in Muted Blue */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="bg-[#F5F1E8] border border-[#DDD7CB] rounded-xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#DDD7CB] pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-9 h-9 rounded-full bg-[#15171A] text-[#F7F4EE] flex items-center justify-center hover:bg-[#25282C] transition cursor-pointer"
                    >
                      <Volume2 size={15} />
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Studio Acoustic Sample</div>
                      <div className="text-[11px] font-mono text-[#8C8983]">16-bit 48kHz · Natural voice prosody</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#6D8192] bg-white px-2.5 py-1 rounded border border-[#DDD7CB]">
                    {isPlayingAudio ? "ANALYZING..." : "CALM CADENCE"}
                  </span>
                </div>

                {/* Physical-feeling SVG Waveform bars */}
                <div className="h-28 flex items-center justify-between gap-1 px-2">
                  {[
                    24, 38, 55, 72, 45, 30, 60, 85, 92, 70, 48, 65, 80, 95, 62, 40,
                    52, 78, 88, 64, 42, 58, 75, 90, 68, 46, 32, 54, 76, 84, 60, 36,
                    48, 70, 82, 58, 38, 50, 65, 78, 55, 35, 45, 62, 74, 52, 30, 22
                  ].map((height, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-[#6D8192] rounded-full transition-all duration-300"
                      style={{
                        height: `${isPlayingAudio ? Math.min(100, height * (0.8 + Math.random() * 0.4)) : height}%`,
                        opacity: isPlayingAudio ? 0.9 : 0.75,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8983]">
                  <span>0.00s</span>
                  <span>Harmonic Resonance: 210 Hz</span>
                  <span>3.42s</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================
            LAYOUT 3: BODY SECTION (Real Human Posture + Subtle Lines)
           ============================================================ */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-8 lg:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6]">
                <img
                  src="/assets/editorial/editorial-posture.jpg"
                  alt="Person sitting in an open, relaxed posture in an architect studio"
                  className="w-full h-auto object-cover max-h-[480px] filter contrast-[101%] saturate-[95%]"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#DDD7CB] text-[11px] font-mono text-[#15171A]">
                  Signal C · Posture & Kinesics
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-[#708C74] tracking-wider">
                  Kinesic Layer
                </span>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Spine Alignment & Bodily Ease
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed pt-1">
                  Open shoulder angles and steady head positioning indicate receptivity and deep presence.
                </p>
              </div>

              {/* 4 Bodily Metrics in Natural Green & Blue */}
              <div className="space-y-3.5 pt-2">
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#708C74]" />
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Spinal Posture</div>
                      <div className="text-[11px] text-[#8C8983]">88° Ergonomic Open Alignment</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#708C74]">Open</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#6D8192]" />
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Eye Contact & Gaze</div>
                      <div className="text-[11px] text-[#8C8983]">Direct, natural unhurried cadence</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#6D8192]">Attentive</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C88A63]" />
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">Micro-Movement</div>
                      <div className="text-[11px] text-[#8C8983]">Steady physical baseline, minimal fidgeting</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#C88A63]">Calm</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#7566A8]" />
                    <div>
                      <div className="text-xs font-semibold text-[#15171A]">General Engagement</div>
                      <div className="text-[11px] text-[#8C8983]">Forward torso inclination (5°)</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#7566A8]">High</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
