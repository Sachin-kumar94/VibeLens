import React from "react";
import { Archive, Calendar, Filter, ArrowUpRight } from "lucide-react";

export const VisualArchive: React.FC = () => {
  const archiveItems = [
    {
      id: "ARC-0941",
      date: "Oct 14, 2026",
      type: "Image + Voice",
      emotion: "Grounded Joy",
      vibe: "Thoughtful Dialogue",
      confidence: "94%",
      thumbnail: "/assets/editorial/editorial-conversation.jpg",
    },
    {
      id: "ARC-0940",
      date: "Oct 12, 2026",
      type: "Multimodal Fusion",
      emotion: "Deep Immersion",
      vibe: "Quiet Study",
      confidence: "91%",
      thumbnail: "/assets/editorial/hero-natural-person.jpg",
    },
    {
      id: "ARC-0939",
      date: "Oct 09, 2026",
      type: "Postural Kinesics",
      emotion: "Open Attentiveness",
      vibe: "Calm Presence",
      confidence: "88%",
      thumbnail: "/assets/editorial/editorial-posture.jpg",
    },
    {
      id: "ARC-0938",
      date: "Oct 05, 2026",
      type: "Vocal Prosody",
      emotion: "Confident Energy",
      vibe: "Presentation Rehearsal",
      confidence: "96%",
      thumbnail: "/assets/editorial/editorial-journal.jpg",
    },
  ];

  return (
    <section className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
              A curated catalog of moments.
            </h2>
            <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
              Organized like an editorial photo library. Browse by context, affect, or signal channel
              to examine how your communication has evolved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8C8983]">
              Archive Storage · 124 Moments Indexed
            </span>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {archiveItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(21,23,26,0.02)] hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-[#EFEAE1]">
                  <img
                    src={item.thumbnail}
                    alt={item.vibe}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 filter contrast-[101%]"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-[#15171A]">
                    {item.id}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#15171A]/80 text-white backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono">
                    {item.confidence}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-mono text-[#8C8983] flex items-center justify-between">
                    <span>{item.date}</span>
                    <span className="text-[#6D8192]">{item.type}</span>
                  </div>
                  <h4 className="font-serif text-lg text-[#15171A] leading-snug">
                    {item.vibe}
                  </h4>
                  <p className="text-xs text-[#8C8983]">
                    Affect: <strong className="text-[#15171A] font-medium">{item.emotion}</strong>
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#F7F4EE] flex items-center justify-between text-xs text-[#8C8983]">
                <span>Inspect full record</span>
                <ArrowUpRight size={13} className="text-[#15171A]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
