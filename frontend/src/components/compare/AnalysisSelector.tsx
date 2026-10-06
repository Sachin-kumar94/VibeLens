import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
  Mic,
  Activity,
  Layers,
  Sparkles,
  ArrowUpDown,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "../ui/Modal";

interface HistoryItem {
  id: string;
  type: "image" | "voice" | "body" | "fusion" | "interview" | "presentation" | string;
  title: string;
  timestamp: string;
  confidence?: number;
  quality?: { rating: "Good" | "Fair" | "Poor" };
  signalQuality?: string | number;
  emotion?: any;
  vibe?: any;
  fileUrl?: string;
  imageUrl?: string;
  context?: string;
  qualityReason?: string;
}

interface AnalysisSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  analyses: HistoryItem[];
  selectedA: HistoryItem | null;
  selectedB: HistoryItem | null;
  onConfirmSelection: (itemA: HistoryItem, itemB: HistoryItem) => void;
}

export const AnalysisSelector: React.FC<AnalysisSelectorProps> = ({
  isOpen,
  onClose,
  analyses,
  selectedA,
  selectedB,
  onConfirmSelection,
}) => {
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");
  const [tempA, setTempA] = useState<HistoryItem | null>(selectedA);
  const [tempB, setTempB] = useState<HistoryItem | null>(selectedB);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempA(selectedA);
      setTempB(selectedB);
    }
  }, [isOpen, selectedA, selectedB]);

  const isDuplicate = tempA && tempB && tempA.id === tempB.id;
  const canConfirm = tempA && tempB && !isDuplicate;

  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter((item) => {
        // Type filter
        if (typeFilter !== "all" && item.type.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }

        // Quality filter
        if (qualityFilter !== "all") {
          const rating = item.quality?.rating || (item.signalQuality ? String(item.signalQuality) : "");
          if (qualityFilter === "good" && !rating.toLowerCase().includes("good")) return false;
          if (qualityFilter === "fair" && !rating.toLowerCase().includes("fair")) return false;
          if (qualityFilter === "poor" && !rating.toLowerCase().includes("poor")) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchType = item.type?.toLowerCase().includes(q);
          const matchContext = item.context?.toLowerCase().includes(q);
          const matchDate = item.timestamp && new Date(item.timestamp).toLocaleDateString().toLowerCase().includes(q);
          if (!matchTitle && !matchType && !matchContext && !matchDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [analyses, typeFilter, qualityFilter, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredAnalyses.length / pageSize) || 1;
  const paginatedItems = filteredAnalyses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectItem = (item: HistoryItem) => {
    if (activeSlot === "A") {
      setTempA(item);
      // Auto advance to B if B isn't set
      if (!tempB) {
        setActiveSlot("B");
      }
    } else {
      setTempB(item);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "image":
        return <Camera size={13} className="text-[#3B82F6]" />;
      case "voice":
        return <Mic size={13} className="text-[#10B981]" />;
      case "body":
        return <Activity size={13} className="text-[#F59E0B]" />;
      case "fusion":
        return <Layers size={13} className="text-[#A855F7]" />;
      default:
        return <Sparkles size={13} className="text-[#707582]" />;
    }
  };

  const formatItemTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { date: "Unknown date", time: "" };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Sessions to Compare"
      subtitle="Choose two distinct saved analyses from your history for side-by-side delta calculation."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Slot Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#F4EFE6] border border-[#DDD7CB]">
          <button
            type="button"
            onClick={() => setActiveSlot("A")}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
              activeSlot === "A"
                ? "bg-white border border-[#DDD7CB] shadow-xs text-[#15171A]"
                : "text-[#575A60] hover:text-[#15171A]"
            }`}
          >
            <div>
              <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#8C8983]">
                Moment A (Target / Current)
              </div>
              <div className="text-xs font-semibold truncate max-w-[190px] sm:max-w-[240px] mt-0.5">
                {tempA ? tempA.title : "None selected"}
              </div>
            </div>
            {tempA && <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveSlot("B")}
            className={`p-3 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
              activeSlot === "B"
                ? "bg-white border border-[#DDD7CB] shadow-xs text-[#15171A]"
                : "text-[#575A60] hover:text-[#15171A]"
            }`}
          >
            <div>
              <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#8C8983]">
                Moment B (Baseline / Previous)
              </div>
              <div className="text-xs font-semibold truncate max-w-[190px] sm:max-w-[240px] mt-0.5">
                {tempB ? tempB.title : "None selected"}
              </div>
            </div>
            {tempB && <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />}
          </button>
        </div>

        {/* Duplicate Warning Alert */}
        {isDuplicate && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-700 shrink-0" />
            <span className="font-medium">
              Choose two different sessions to compare. You have selected the same analysis for Moment A and Moment B.
            </span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, context, or date..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD7CB] text-xs text-[#15171A] placeholder-[#8C8983] outline-hidden focus:border-[#15171A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[#8C8983] hover:text-[#15171A]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => {
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 rounded-xl bg-white border border-[#DDD7CB] text-xs text-[#15171A] hover:bg-[#FAF8F5] transition flex items-center gap-1 shrink-0 cursor-pointer"
                title="Toggle sort order"
              >
                <ArrowUpDown size={12} className="text-[#8C8983]" />
                <span className="text-[11px] capitalize">{sortOrder}</span>
              </button>

              <select
                value={qualityFilter}
                onChange={(e) => {
                  setQualityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 rounded-xl bg-white border border-[#DDD7CB] text-[11px] text-[#15171A] outline-hidden cursor-pointer"
              >
                <option value="all">All Qualities</option>
                <option value="good">Good Quality</option>
                <option value="fair">Fair Quality</option>
                <option value="poor">Poor Quality</option>
              </select>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["all", "image", "voice", "body", "fusion", "interview", "presentation"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTypeFilter(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                  typeFilter === type
                    ? "bg-[#15171A] text-white"
                    : "bg-[#FAF8F5] text-[#575A60] hover:text-[#15171A] border border-[#DDD7CB]"
                }`}
              >
                {type === "all" ? "All Sessions" : type}
              </button>
            ))}
            <span className="ml-auto text-[11px] font-mono text-[#8C8983] shrink-0 pr-1">
              {filteredAnalyses.length} found
            </span>
          </div>
        </div>

        {/* History List Grid */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {filteredAnalyses.length === 0 ? (
            <div className="py-12 text-center text-[#8C8983] text-xs">
              No analyses matching your search or filters.
            </div>
          ) : (
            paginatedItems.map((item) => {
              const { date, time } = formatItemTime(item.timestamp);
              const isSelectedA = tempA?.id === item.id;
              const isSelectedB = tempB?.id === item.id;
              const quality = item.quality?.rating || (item.signalQuality ? String(item.signalQuality) : "Good");
              const confidence = item.confidence || item.emotion?.confidence || 85;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelectedA && isSelectedB
                      ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-300"
                      : isSelectedA
                      ? "bg-[#E6F4EA] border-[#10B981] ring-2 ring-[#10B981]/30"
                      : isSelectedB
                      ? "bg-[#EFF6FF] border-[#3B82F6] ring-2 ring-[#3B82F6]/30"
                      : "bg-white border-[#DDD7CB] hover:border-[#8C8983] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] overflow-hidden flex items-center justify-center shrink-0">
                      {item.fileUrl || item.imageUrl ? (
                        <img
                          src={item.fileUrl || item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getTypeIcon(item.type)
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD7CB] text-[#15171A] flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </span>
                        <h4 className="text-xs font-bold text-[#15171A] truncate">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#707582] mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {date} · {time}
                        </span>
                        <span>•</span>
                        <span>{confidence}% conf</span>
                        <span>•</span>
                        <span className="text-[#10B981] font-semibold">{quality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelectedA && (
                      <span className="px-2 py-0.5 rounded-md bg-[#10B981] text-white text-[10px] font-mono font-bold">
                        Moment A
                      </span>
                    )}
                    {isSelectedB && (
                      <span className="px-2 py-0.5 rounded-md bg-[#3B82F6] text-white text-[10px] font-mono font-bold">
                        Moment B
                      </span>
                    )}
                    {!isSelectedA && !isSelectedB && (
                      <button
                        type="button"
                        className="text-[11px] font-medium text-[#707582] hover:text-[#15171A] px-2 py-1 rounded bg-[#FAF8F5] border border-[#DDD7CB]"
                      >
                        Select for {activeSlot}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-[#707582] pt-2 border-t border-[#DDD7CB]">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#DDD7CB] text-xs font-medium disabled:opacity-40 hover:bg-[#FAF8F5] cursor-pointer"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-[#DDD7CB] text-xs font-medium disabled:opacity-40 hover:bg-[#FAF8F5] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DDD7CB]">
          <div className="text-xs text-[#707582]">
            {isDuplicate ? (
              <span className="text-amber-700 font-semibold">Please select two different sessions.</span>
            ) : tempA && tempB ? (
              <span className="text-[#10B981] font-medium">Ready to compare.</span>
            ) : (
              <span>Select both Moment A and Moment B to continue.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-transparent border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => {
                if (tempA && tempB && !isDuplicate) {
                  onConfirmSelection(tempA, tempB);
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2B2E33] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
            >
              Compare Selected
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
