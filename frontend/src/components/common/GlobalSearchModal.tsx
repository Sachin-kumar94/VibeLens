import React, { useState, useEffect } from "react";
import { Search, X, ArrowRight, Camera, Mic, Activity, Layers, BookOpen, BarChart3, Shield } from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  category: "Modality" | "Insight" | "Analysis" | "Journal";
  path: string;
  icon: React.ReactNode;
  subtitle: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");

  const searchItems: SearchItem[] = [
    {
      id: "dash",
      title: "Dashboard Overview",
      category: "Modality",
      path: "/dashboard",
      icon: <BarChart3 size={16} className="text-[#15171A]" />,
      subtitle: "Personal baseline, morning greeting, and recent analyses.",
    },
    {
      id: "img",
      title: "Image & Facial Affect Studio",
      category: "Modality",
      path: "/image",
      icon: <Camera size={16} className="text-[#15171A]" />,
      subtitle: "Evaluate micro-expressions, periocular tension, and lighting quality.",
    },
    {
      id: "batch",
      title: "Batch Image Analysis",
      category: "Modality",
      path: "/batch",
      icon: <Camera size={16} className="text-[#71889C]" />,
      subtitle: "Multi-file queue processing and aggregate sentiment reporting.",
    },
    {
      id: "voice",
      title: "Vocal Prosody & Acoustics",
      category: "Modality",
      path: "/voice",
      icon: <Mic size={16} className="text-[#71889C]" />,
      subtitle: "Speech cadence (WPM), pitch stability, harmonic resonance.",
    },
    {
      id: "body",
      title: "Body Kinesics & Posture",
      category: "Modality",
      path: "/body",
      icon: <Activity size={16} className="text-[#748D76]" />,
      subtitle: "88° spinal alignment, open chest posture, shoulder balance.",
    },
    {
      id: "fusion",
      title: "Multimodal Fusion Engine",
      category: "Modality",
      path: "/fusion",
      icon: <Layers size={16} className="text-[#C48A66]" />,
      subtitle: "Synthesizing facial, vocal, and bodily cues into a 91% unified vibe.",
    },
    {
      id: "coach",
      title: "Presentation & Keynote Coach",
      category: "Insight",
      path: "/presentation-coach",
      icon: <Activity size={16} className="text-[#15171A]" />,
      subtitle: "Dry-run delivery assessment with pacing and eye engagement.",
    },
    {
      id: "interview",
      title: "Interview Practice Lab",
      category: "Insight",
      path: "/interview",
      icon: <Mic size={16} className="text-[#71889C]" />,
      subtitle: "Mock interview prompts with poise and confidence scoring.",
    },
    {
      id: "journal",
      title: "Vibe Journal & Notes",
      category: "Journal",
      path: "/journal",
      icon: <BookOpen size={16} className="text-[#C48A66]" />,
      subtitle: "Linen-bound digital notes and reflective emotional timestamps.",
    },
    {
      id: "analytics",
      title: "Editorial Analytics & Baseline",
      category: "Insight",
      path: "/analytics",
      icon: <BarChart3 size={16} className="text-[#748D76]" />,
      subtitle: "7-day mood timeline, weekly synthesis report, delta baseline.",
    },
    {
      id: "archive",
      title: "Visual Archive Catalog",
      category: "Analysis",
      path: "/history",
      icon: <Camera size={16} className="text-[#15171A]" />,
      subtitle: "Searchable history of historical sessions and comparative logs.",
    },
    {
      id: "privacy",
      title: "Privacy Center & Local Data",
      category: "Insight",
      path: "/profile",
      icon: <Shield size={16} className="text-[#748D76]" />,
      subtitle: "Inspect local storage, download JSON archive, or zero out data.",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchItems;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 bg-[#15171A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#FAF8F5] border border-[#DDD7CB] rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#DDD7CB] bg-white gap-3">
          <Search size={18} className="text-[#8C8983]" />
          <input
            type="text"
            placeholder="Search modalities, reflections, vibes, or tools... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#15171A] placeholder-[#8C8983] outline-hidden font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#8C8983] hover:text-[#15171A] p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#8C8983] bg-[#EFEAE1] px-2 py-0.5 rounded border border-[#DDD7CB]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#DDD7CB]/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8C8983]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className="w-full text-left px-3.5 py-3 hover:bg-[#EFEAE1]/70 rounded-xl transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDD7CB] flex items-center justify-center shrink-0 shadow-2xs">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#15171A] group-hover:text-black">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#EFEAE1] text-[#8C8983]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C8983] line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-[#8C8983] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition"
                />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#EFEAE1]/60 border-t border-[#DDD7CB] flex items-center justify-between text-[11px] text-[#8C8983]">
          <span>Natural Humanistic Navigation</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#DDD7CB]">↵</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
