import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  Image as ImageIcon,
  Mic,
  Activity,
  Calendar,
  Sparkles,
  Check,
  RefreshCw,
} from "lucide-react";
import { api } from "../../services/api";

export interface HistorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetModality: "image" | "voice" | "body";
  onSelect: (analysis: any) => void;
}

export const HistorySelectorModal: React.FC<HistorySelectorModalProps> = ({
  isOpen,
  onClose,
  targetModality,
  onSelect,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "quality">("newest");

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, targetModality]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Fetch analyses from backend scoped to user
      const data = await api.getAnalyses(targetModality);
      setItems(data || []);
    } catch (err) {
      console.warn("Failed to load history for modal:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter items
  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (item.title || "").toLowerCase().includes(q);
    const emotionMatch = (item.emotion || "").toLowerCase().includes(q);
    const vibeMatch = (item.vibe || "").toLowerCase().includes(q);
    const contextMatch = (item.context || "").toLowerCase().includes(q);
    return titleMatch || emotionMatch || vibeMatch || contextMatch;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime();
    }
    if (sortBy === "quality") {
      const qA = a.signalQuality === "Good" ? 90 : 70;
      const qB = b.signalQuality === "Good" ? 90 : 70;
      return (qB + (b.confidence || 0)) - (qA + (a.confidence || 0));
    }
    // Default newest
    return new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime();
  });

  const getModalityIcon = () => {
    if (targetModality === "image") return <ImageIcon size={16} className="text-[#3B82F6]" />;
    if (targetModality === "voice") return <Mic size={16} className="text-[#8B5CF6]" />;
    return <Activity size={16} className="text-[#10B981]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E6E2D8] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            {getModalityIcon()}
            <h3 className="text-sm font-semibold text-[#15171A] capitalize">
              Select Previous {targetModality} Analysis
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE5D9] text-[#525866]">
              {items.length} records
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#707582] hover:text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-[#E6E2D8] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, emotion, or context..."
              className="w-full bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#15171A] outline-hidden focus:border-[#15171A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl px-3 py-2 text-xs text-[#15171A] outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="quality">Highest Quality</option>
            </select>

            <button
              type="button"
              onClick={loadHistory}
              className="p-2 rounded-xl border border-[#DDD8CD] bg-white hover:bg-[#FAF8F5] text-[#525866] hover:text-[#15171A] transition cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C8983] space-y-2">
              <RefreshCw size={20} className="animate-spin mx-auto text-[#A855F7]" />
              <p>Loading historical records...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C8983] space-y-2">
              <Sparkles size={24} className="mx-auto text-[#DDD8CD]" />
              <p className="font-semibold text-[#15171A]">No previous {targetModality} analyses found</p>
              <p className="text-[11px]">Perform a new capture or upload to connect this modality.</p>
            </div>
          ) : (
            sorted.map((item) => {
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8] hover:border-[#15171A] hover:bg-white transition cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.fileUrl || item.imageUrl ? (
                      <img
                        src={item.fileUrl || item.imageUrl}
                        alt="Thumbnail"
                        className="w-12 h-14 rounded-xl object-cover border border-[#DDD8CD] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#DDD8CD] flex items-center justify-center shrink-0">
                        {getModalityIcon()}
                      </div>
                    )}

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#15171A] truncate group-hover:text-[#A855F7] transition">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#8C8983] shrink-0">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#707582] truncate">
                        {item.emotion || item.vibe || "Signal Record"}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] font-semibold">
                          Quality {item.signalQuality === "Good" ? "92%" : "78%"}
                        </span>
                        <span className="text-[#8C8983]">
                          Confidence {item.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] group-hover:bg-[#15171A] group-hover:text-white group-hover:border-[#15171A] text-xs font-semibold text-[#15171A] transition cursor-pointer shrink-0"
                  >
                    Select
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
