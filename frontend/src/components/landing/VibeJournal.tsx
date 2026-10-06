import React from "react";
import { BookOpen, Calendar, Edit3, Heart } from "lucide-react";

export const VibeJournal: React.FC = () => {
  const entries = [
    {
      date: "Tuesday, Oct 14",
      time: "09:30 AM",
      emotion: "Grounded Confidence",
      vibe: "Thoughtful & Receptive",
      context: "Morning creative review with architect partner",
      note: "Felt very natural today. When discussing the revisions, my vocal pitch remained calm and I didn't feel the urge to rush my answers.",
      photo: "/assets/editorial/editorial-conversation.jpg",
      signals: ["Pacing 142 WPM", "Spine 88°", "Tone Warm"],
    },
    {
      date: "Friday, Oct 10",
      time: "02:15 PM",
      emotion: "Deep Focus",
      vibe: "Quiet Immersion",
      context: "Writing essay in library corner with tea",
      note: "Minimal fidgeting. Eyes stayed relaxed despite prolonged screen time. Breathing was measured and diaphragmatic.",
      photo: "/assets/editorial/hero-natural-person.jpg",
      signals: ["Focus 94%", "Blink 12/min", "Silence ratio 88%"],
    },
    {
      date: "Monday, Oct 06",
      time: "11:00 AM",
      emotion: "Gentle Curiosity",
      vibe: "Open Dialogue",
      context: "Introductory team conversation",
      note: "Noticed slight initial tightness in shoulders that dissolved after the first two minutes as genuine laughter emerged.",
      photo: "/assets/editorial/editorial-posture.jpg",
      signals: ["Smile frequency +4", "Micro-tension resolved"],
    },
  ];

  return (
    <section id="journal" className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
              A digital notebook for your moments.
            </h2>
            <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
              Warm, paper-like surfaces designed for reflective contemplation.
              Review your days not as raw analytical data, but as a living human journal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8C8983]">
              Linen Bound · 3 Entries Saved
            </span>
          </div>
        </div>

        {/* Still Life Journal Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-[#DDD7CB] max-h-[300px] shadow-[0_2px_12px_rgba(21,23,26,0.03)]">
          <img
            src="/assets/editorial/editorial-journal.jpg"
            alt="Open linen notebook and ceramic coffee cup on oak desk in morning light"
            className="w-full h-full object-cover max-h-[300px] filter contrast-[101%] saturate-[95%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15171A]/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
            <div className="text-white">
              <span className="text-[11px] font-mono tracking-widest uppercase opacity-80">
                Personal Log
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl mt-1">
                Reflections on presence, voice, and connection.
              </h3>
            </div>
          </div>
        </div>

        {/* Notebook Timeline Entries */}
        <div className="space-y-6">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-6 sm:p-8 shadow-[0_1px_4px_rgba(21,23,26,0.02)] hover:shadow-md transition-all duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Thumbnail & Tags */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
                  <img
                    src={entry.photo}
                    alt={entry.context}
                    className="w-full sm:w-44 lg:w-full h-36 object-cover rounded-xl border border-[#E6E1D6]"
                  />
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#8C8983]">
                      <Calendar size={13} />
                      <span className="font-semibold text-[#15171A]">{entry.date}</span>
                      <span>·</span>
                      <span className="font-mono">{entry.time}</span>
                    </div>
                    <div className="text-[#6D8192] font-medium">
                      {entry.vibe}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.signals.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#F7F4EE] border border-[#E6E1D6] text-[10px] font-mono text-[#8C8983]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Handwritten Note & Thought */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">
                      Context
                    </span>
                    <h4 className="font-serif text-xl sm:text-2xl text-[#15171A] mt-0.5">
                      {entry.context}
                    </h4>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl p-5 relative">
                    <span className="text-[10px] font-mono uppercase text-[#8C8983] tracking-wider block mb-2">
                      Personal Reflection Note
                    </span>
                    <p className="text-sm sm:text-[14.5px] text-[#25282C] leading-relaxed italic">
                      “{entry.note}”
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8C8983] pt-1">
                    <span>Observed State: <strong className="text-[#15171A]">{entry.emotion}</strong></span>
                    <span className="text-[#708C74] font-medium">Saved to Archive</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
