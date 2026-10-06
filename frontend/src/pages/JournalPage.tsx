import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Trash2,
  Camera,
  Mic,
  Activity,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { api, JournalEntry } from "../services/api";

interface JournalPageProps {
  onNavigate: (path: string) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const journalData = await api.getJournal();
      setEntries(journalData || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load journal records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal reflection?")) return;
    try {
      await api.deleteJournalEntry(id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete entry");
    }
  };

  const getModalityIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Camera size={14} className="text-[#3B82F6]" />;
      case "voice":
        return <Mic size={14} className="text-[#8B5CF6]" />;
      case "body":
        return <Activity size={14} className="text-[#10B981]" />;
      default:
        return <Sparkles size={14} className="text-[#A855F7]" />;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    // Modality filter
    if (activeFilter !== "all" && entry.sourceMode !== activeFilter) {
      return false;
    }
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const vibeMatch = (entry.vibe || "").toLowerCase().includes(q);
    const contextMatch = (entry.context || "").toLowerCase().includes(q);
    const noteMatch = (entry.userNote || "").toLowerCase().includes(q);
    return vibeMatch || contextMatch || noteMatch;
  });

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#DDD7CB] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#15171A]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
              Reflective Signal Log
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
            Vibe & Presence Journal
          </h1>
          <p className="text-sm sm:text-base text-[#575A60] mt-2 max-w-xl">
            Synthesize qualitative self-reflections with quantitative physiological micro-signals.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEntries}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB]">
        {/* Modality Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "All Records" },
            { id: "fusion", label: "Fusion" },
            { id: "voice", label: "Voice" },
            { id: "body", label: "Body" },
            { id: "image", label: "Visual" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-[#15171A] text-white shadow-xs"
                  : "bg-white border border-[#DDD7CB] text-[#525866] hover:text-[#15171A] hover:bg-[#EFEAE1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections..."
            className="w-full bg-white border border-[#DDD7CB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#15171A] outline-hidden focus:border-[#15171A] transition"
          />
        </div>
      </div>

      {/* Full-Width Chronological Signal History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#8C8983]">
            Chronological Signal History ({filteredEntries.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-[#707582] flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            <span>Loading reflections...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-2">
            <BookOpen size={28} className="text-[#8C8983] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#15171A]">No journal reflections found</p>
            <p className="text-[11px] text-[#707582]">
              {searchQuery || activeFilter !== "all"
                ? "Try clearing your search or filter criteria."
                : "Record analyses in Multimodal Fusion, Voice, or Body to populate your journal."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const dateFormatted = new Date(entry.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={entry.id}
                  className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-4 hover:border-[#8C8983] transition shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-white border border-[#DDD7CB]">
                        {getModalityIcon(entry.sourceMode)}
                      </span>
                      <span className="text-xs font-bold text-[#15171A]">{entry.vibe}</span>
                      <span className="text-[10px] font-mono text-[#8C8983]">
                        • {entry.context}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-[#8C8983]">
                        {dateFormatted}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-[#8C8983] hover:text-rose-600 transition cursor-pointer"
                        title="Delete reflection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#333] leading-relaxed whitespace-pre-wrap">
                    {entry.userNote}
                  </p>

                  {/* Attached Signal Badge */}
                  {entry.signalsObserved && entry.signalsObserved.length > 0 && (
                    <div className="pt-2 border-t border-[#DDD7CB] flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-mono text-[#8C8983] uppercase">
                        Observed Signals:
                      </span>
                      {entry.signalsObserved.map((sig, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-white border border-[#DDD7CB] text-[10px] font-medium text-[#15171A]"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
