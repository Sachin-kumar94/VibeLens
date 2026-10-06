import React from "react";
import { Camera, Volume2, Users } from "lucide-react";

interface TrustAndFeatureIntroProps {
  onNavigateSection?: (id: string) => void;
}

export const TrustAndFeatureIntro: React.FC<TrustAndFeatureIntroProps> = ({
  onNavigateSection,
}) => {
  return (
    <section id="features" className="bg-[#F6F3EC] border-b border-[#DDD8CD]/60">
      {/* 1. TRUST SECTION (Section 17 - Strictly matching reference design) */}
      <div className="py-12 border-b border-[#DDD8CD]/50">
        <div className="max-w-[1420px] mx-auto px-6 sm:px-10 lg:px-14 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#858881] font-semibold mb-8">
            TRUSTED BY LEARNERS, PROFESSIONALS AND INNOVATIVE TEAMS
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300 select-none">
            {/* Google */}
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-[#555A58]">
              Google
            </span>

            {/* Microsoft */}
            <div className="flex items-center gap-2 text-[#555A58]">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <span className="bg-[#555A58] w-1.5 h-1.5" />
                <span className="bg-[#555A58] w-1.5 h-1.5" />
                <span className="bg-[#555A58] w-1.5 h-1.5" />
                <span className="bg-[#555A58] w-1.5 h-1.5" />
              </div>
              <span className="font-sans font-semibold text-lg tracking-tight">Microsoft</span>
            </div>

            {/* Adobe */}
            <div className="flex items-center gap-1.5 text-[#555A58]">
              <span className="font-serif font-black text-xl">A</span>
              <span className="font-sans font-bold text-lg tracking-tight">Adobe</span>
            </div>

            {/* Amazon */}
            <span className="font-sans font-bold text-xl tracking-tight text-[#555A58]">
              amazon
            </span>

            {/* Stanford */}
            <span className="font-serif font-bold text-lg tracking-wide text-[#555A58]">
              Stanford
            </span>

            {/* NYU */}
            <div className="flex items-center gap-1 text-[#555A58]">
              <span className="w-4 h-4 bg-[#555A58] text-[#F6F3EC] flex items-center justify-center text-[10px] font-bold">
                N
              </span>
              <span className="font-sans font-bold text-lg tracking-wider">NYU</span>
            </div>

            {/* HubSpot */}
            <span className="font-sans font-bold text-lg tracking-tight text-[#555A58]">
              HubSpot
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION: A MORE HUMAN WAY TO SEE PEOPLE (Sections 18-22) */}
      <div className="py-20 max-w-[1420px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Heading with Warm Brown Underline Bar */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#17191A] leading-[1.12] tracking-tight">
              A more human <br />
              way to see people.
            </h2>
            <div className="w-12 h-1 bg-[#A97858] rounded-full" />
            <p className="text-xs sm:text-sm text-[#555A58] pt-2 max-w-xs font-sans leading-relaxed">
              VibeLens explores several kinds of signals without reducing a person to a single score.
            </p>
          </div>

          {/* Right: 3 Handcrafted Feature Preview Cards (Matches Reference Concept) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Visual Analysis */}
            <div
              onClick={() => onNavigateSection && onNavigateSection("how-it-works")}
              className="bg-white rounded-2xl p-6 border border-[#DDD8CD] shadow-[0_2px_10px_rgba(23,25,26,0.03)] hover:shadow-md hover:border-[#858881] transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#17191A] mb-4 group-hover:scale-105 transition-transform">
                <Camera size={20} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans font-bold text-sm text-[#17191A] mb-1.5">
                Visual Analysis
              </h3>
              <p className="text-xs text-[#555A58] leading-relaxed font-sans">
                Read expressions, body language and presence.
              </p>
            </div>

            {/* Vocal Analysis */}
            <div
              onClick={() => onNavigateSection && onNavigateSection("how-it-works")}
              className="bg-white rounded-2xl p-6 border border-[#DDD8CD] shadow-[0_2px_10px_rgba(23,25,26,0.03)] hover:shadow-md hover:border-[#858881] transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#17191A] mb-4 group-hover:scale-105 transition-transform">
                <Volume2 size={20} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans font-bold text-sm text-[#17191A] mb-1.5">
                Vocal Analysis
              </h3>
              <p className="text-xs text-[#555A58] leading-relaxed font-sans">
                Understand tone, emotion and speaking patterns.
              </p>
            </div>

            {/* Behavioral Insights */}
            <div
              onClick={() => onNavigateSection && onNavigateSection("how-it-works")}
              className="bg-white rounded-2xl p-6 border border-[#DDD8CD] shadow-[0_2px_10px_rgba(23,25,26,0.03)] hover:shadow-md hover:border-[#858881] transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#17191A] mb-4 group-hover:scale-105 transition-transform">
                <Users size={20} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans font-bold text-sm text-[#17191A] mb-1.5">
                Behavioral Insights
              </h3>
              <p className="text-xs text-[#555A58] leading-relaxed font-sans">
                See patterns that reveal the bigger picture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
