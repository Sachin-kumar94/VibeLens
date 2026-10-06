import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Play, Users, Building2, GraduationCap } from "lucide-react";

interface NaturalHeroProps {
  onExplore: () => void;
  onSeeHowItWorks: () => void;
  onWatchDemo?: () => void;
  className?: string;
}

export const NaturalHero: React.FC<NaturalHeroProps> = ({
  onExplore,
  onSeeHowItWorks,
  onWatchDemo = onSeeHowItWorks,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setMousePos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Subtle physical parallax (2-4px image, 3-6px labels)
  const imgShiftX = mousePos.x * 2.5;
  const imgShiftY = mousePos.y * 2;

  return (
    <section
      ref={containerRef}
      className={`relative pt-24 pb-8 sm:pt-28 sm:pb-12 overflow-hidden bg-[#F6F3EC] select-none ${className}`}
    >
      {/* ============================================================
          RIGHT: Seamless Full-Bleed Editorial Photography (Matches Reference)
         ============================================================ */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] xl:w-[55%] overflow-hidden pointer-events-none select-none">
        <img
          src="/assets/editorial/hero-reference-woman.jpg"
          alt="Individual at wooden workspace in natural daylight"
          className="w-full h-full object-cover object-[center_right] lg:object-center transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${imgShiftX}px, ${imgShiftY}px, 0) scale(1.02)`,
          }}
        />

        {/* Soft edge gradient feather dissolving cleanly into #F6F3EC on the left */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-64 xl:w-80 bg-gradient-to-r from-[#F6F3EC] via-[#F6F3EC]/85 to-transparent" />

        {/* Mobile / Tablet overlay for text readability */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-r from-[#F6F3EC] via-[#F6F3EC]/92 to-[#F6F3EC]/50" />

        {/* Handwritten Script Calligraphy on Wall (Matches Reference Image) */}
        <div className="absolute top-[38%] right-8 xl:right-12 -translate-y-1/2 text-right pointer-events-none select-none hidden lg:block z-10">
          <div className="font-serif italic text-2xl xl:text-3xl text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] tracking-wider">
            Observe
          </div>
          <div className="font-serif italic text-2xl xl:text-3xl text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] tracking-wider mt-0.5">
            Understand
          </div>
          <div className="font-serif italic text-2xl xl:text-3xl text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] tracking-wider mt-0.5 flex items-center justify-end gap-1.5">
            <span>Grow</span>
            <span className="text-base text-white/90">♡</span>
          </div>
        </div>

        {/* Floating Social Proof Card in Lower Right (Matches Reference Concept) */}
        <div className="hidden sm:block absolute bottom-8 right-8 xl:bottom-10 xl:right-12 bg-white/95 rounded-2xl p-4 xl:p-5 border border-[#DDD8CD] shadow-[0_8px_30px_rgba(23,25,26,0.08)] backdrop-blur-md max-w-[290px] select-none z-20 pointer-events-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="/assets/editorial/hero-editorial-woman.jpg"
                alt=""
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="/assets/editorial/body-man-frontal.jpg"
                alt=""
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="/assets/editorial/editorial-conversation.jpg"
                alt=""
              />
            </div>
            <span className="text-xs font-bold text-[#17191A]">12K+</span>
          </div>
          <p className="text-[11px] text-[#555A58] leading-snug">
            People are already exploring human insights with VibeLens.
          </p>
        </div>
      </div>

      {/* ============================================================
          LEFT: Editorial Typography, CTAs, & Audience Strip
         ============================================================ */}
      <div className="relative z-10 max-w-[1420px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="max-w-xl lg:max-w-[560px] space-y-7 pt-4 sm:pt-8 pb-4">
          {/* Eyebrow with trailing thin rule */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#858881] font-semibold">
              HUMAN INSIGHTS, REAL IMPACT
            </span>
            <span className="w-8 h-[1px] bg-[#DDD8CD]" />
          </div>

          {/* Main Editorial Display Headline */}
          <h1 className="font-serif text-[48px] sm:text-[62px] lg:text-[76px] text-[#17191A] leading-[1.05] tracking-tight">
            Understand <br />
            people <span className="text-[#A97858] font-serif">beyond</span> <br />
            what they say.
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base lg:text-[17px] text-[#555A58] leading-relaxed max-w-lg font-sans">
            VibeLens helps you decode visual, vocal and behavioral signals with responsible AI — so you can communicate better, build stronger relationships, and make smarter decisions.
          </p>

          {/* Call To Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={onExplore}
              className="px-7 py-3.5 rounded-full bg-[#17191A] hover:bg-[#2A2E2C] text-[#F6F3EC] text-sm font-medium transition-all shadow-[0_4px_16px_rgba(23,25,26,0.18)] hover:shadow-lg cursor-pointer flex items-center gap-2 group active:scale-98"
            >
              <span>Start for Free</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onWatchDemo}
              className="px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#17191A] border border-[#DDD8CD] text-sm font-medium transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-2.5 active:scale-98"
            >
              <Play size={13} className="fill-[#17191A] text-[#17191A]" />
              <span>Watch a quick demo</span>
            </button>
          </div>

          {/* Audience Strip (Section 16 - Matches Reference Image) */}
          <div className="grid grid-cols-3 gap-3 pt-6 sm:pt-8 border-t border-[#DDD8CD]/70">
            {/* For Individuals */}
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#17191A] flex-shrink-0">
                <Users size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#17191A]">For Individuals</div>
                <div className="text-[11px] text-[#858881] leading-tight">Self-awareness & growth</div>
              </div>
            </div>

            {/* For Professionals */}
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#17191A] flex-shrink-0">
                <Building2 size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#17191A]">For Professionals</div>
                <div className="text-[11px] text-[#858881] leading-tight">Better communication</div>
              </div>
            </div>

            {/* For Educators */}
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#17191A] flex-shrink-0">
                <GraduationCap size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#17191A]">For Educators</div>
                <div className="text-[11px] text-[#858881] leading-tight">Support & understand</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
