import React from "react";
import { Camera, Mic, Briefcase, GraduationCap, Heart, Users, ArrowRight } from "lucide-react";

export const EditorialUseCases: React.FC = () => {
  return (
    <section id="use-cases" className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Designed for genuine human situations.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            From rehearsing pivotal keynotes to cultivating team presence,
            VibeLens adapts to where nuance matters most.
          </p>
        </div>

        {/* Asymmetrical Non-Identical Blocks (6 Use Cases) */}
        <div className="space-y-6">
          
          {/* Row 1: 60/40 Split (Presentations & Creators) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Block 1: Presentations (Wide 7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-10 shadow-[0_2px_8px_rgba(21,23,26,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#6D8192] uppercase tracking-wider mb-3">
                  <Mic size={14} />
                  <span>Public Speaking</span>
                </div>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Keynotes & Presentations
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed mt-3 max-w-lg">
                  Rehearse without self-consciousness. Observe vocal pace, detect monotone inflection before stepping onstage, and practice comfortable pauses.
                </p>
              </div>
              <div className="pt-6 border-t border-[#F7F4EE] flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[#25282C]">
                  Speech Pace Tracking
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[#25282C]">
                  Pause Interval Analysis
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[#25282C]">
                  Acoustic Resonance
                </span>
              </div>
            </div>

            {/* Block 2: Creators (Tall 5 cols) */}
            <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#DDD7CB] rounded-2xl p-8 sm:p-10 shadow-[0_2px_8px_rgba(21,23,26,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#C88A63] uppercase tracking-wider mb-3">
                  <Camera size={14} />
                  <span>Media & Visuals</span>
                </div>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Content Creators
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed mt-3">
                  Check whether thumbnail stills and video intros capture genuine warmth or feel forced and synthetic.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E6E1D6] text-xs text-[#15171A] font-medium flex items-center gap-2">
                <span>Natural expression verification</span>
                <ArrowRight size={13} className="text-[#8C8983]" />
              </div>
            </div>
          </div>

          {/* Row 2: 40/60 Split (Interview Practice & Communication Coaching) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Block 3: Interview Practice (5 cols) */}
            <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#DDD7CB] rounded-2xl p-8 sm:p-10 shadow-[0_2px_8px_rgba(21,23,26,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#708C74] uppercase tracking-wider mb-3">
                  <Briefcase size={14} />
                  <span>Careers & Recruitment</span>
                </div>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Interview Practice
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed mt-3">
                  Practice answering challenging questions while keeping your shoulders relaxed and your breathing unhurried.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E6E1D6] text-xs text-[#708C74] font-medium">
                Calm baseline feedback
              </div>
            </div>

            {/* Block 4: Coaching & Education (7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-10 shadow-[0_2px_8px_rgba(21,23,26,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#7566A8] uppercase tracking-wider mb-3">
                  <GraduationCap size={14} />
                  <span>Pedagogy & Coaching</span>
                </div>
                <h3 className="font-serif text-3xl text-[#15171A]">
                  Education & Mentorship
                </h3>
                <p className="text-sm text-[#8C8983] leading-relaxed mt-3 max-w-lg">
                  Help educators understand classroom engagement and guide students to develop interpersonal confidence in digital seminars.
                </p>
              </div>
              <div className="pt-6 border-t border-[#F7F4EE] flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[#25282C]">
                  Listener Attention Signals
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[#25282C]">
                  Fatigue Detection
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: 50/50 Split (Personal Reflection & Collaborative Teams) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_8px_rgba(21,23,26,0.02)] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C88A63] uppercase tracking-wider">
                <Heart size={14} />
                <span>Self-Awareness</span>
              </div>
              <h3 className="font-serif text-2xl text-[#15171A]">
                Mindful Self-Reflection
              </h3>
              <p className="text-xs text-[#8C8983] leading-relaxed">
                Log quiet reflections after demanding days. Learn your personal indicators of physical ease and mental clarity over time.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_8px_rgba(21,23,26,0.02)] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#6D8192] uppercase tracking-wider">
                <Users size={14} />
                <span>Team Culture</span>
              </div>
              <h3 className="font-serif text-2xl text-[#15171A]">
                Collaborative Teams
              </h3>
              <p className="text-xs text-[#8C8983] leading-relaxed">
                Create meetings where everyone feels heard. Recognize non-verbal signs of disconnect before misunderstandings arise.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
