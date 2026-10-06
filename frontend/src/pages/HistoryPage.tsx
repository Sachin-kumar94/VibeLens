import React, { useState, useEffect } from "react";
import {
  Camera,
  Mic,
  Activity,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Trash2,
  Calendar,
  Columns,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import { api } from "../services/api";

interface HistoryPageProps {
  onNavigate: (path: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModality, setActiveModality] = useState<string>("all");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, [activeModality]);

  const loadAnalyses = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getAnalyses(activeModality);
      setItems(data || []);

      // Auto-select first two for compare if none selected
      if (selectedForCompare.length === 0 && data && data.length >= 2) {
        setSelectedForCompare([data[0].id, data[1].id]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load analysis archive.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this analysis?")) return;

    try {
      await api.deleteAnalysis(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedForCompare((prev) => prev.filter((i) => i !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete analysis.");
    }
  };

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setSelectedForCompare([selectedForCompare[1], id]);
      }
    }
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length === 2) {
      // Store selected IDs in sessionStorage for ComparePage to read
      sessionStorage.setItem("vibelens_compare_ids", JSON.stringify(selectedForCompare));
      onNavigate("/compare");
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vibe || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.emotion || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.qualityReason || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getModalityIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Camera size={14} className="text-[#3B82F6]" />;
      case "voice":
        return <Mic size={14} className="text-[#8B5CF6]" />;
      case "body":
        return <Activity size={14} className="text-[#10B981]" />;
      case "fusion":
        return <Layers size={14} className="text-[#A855F7]" />;
      case "interview":
        return <Award size={14} className="text-[#C18A69]" />;
      case "presentation":
        return <Sparkles size={14} className="text-[#786D9D]" />;
      default:
        return <Sparkles size={14} className="text-[#707582]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#15171A] tracking-tight">
            Signal History & Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#707582] mt-0.5">
            Your unified cross-modal archive recorded across image, voice, kinesics, fusion, and interview practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedForCompare.length === 2 && (
            <button
              type="button"
              onClick={handleCompareClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#252833] cursor-pointer shadow-sm transition"
            >
              <Columns size={14} />
              <span>Compare Selected (2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadAnalyses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-medium text-[#15171A] cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E6E2D8] shadow-2xs">
        {/* Modality Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#DDD8CD] w-full sm:w-auto">
          {["all", "image", "voice", "body", "fusion", "interview", "presentation"].map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setActiveModality(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                activeModality === mod
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              {mod === "all" ? "All Modalities" : mod}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] px-3.5 py-1.5 rounded-xl border border-[#DDD8CD] w-full sm:w-72">
          <Search size={14} className="text-[#8C8983]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals, emotions..."
            className="w-full bg-transparent text-xs text-[#15171A] placeholder-[#8C8983] outline-hidden font-sans"
          />
        </div>
      </div>

      {/* Archive Items Grid / List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#707582] flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <span>Loading signal history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E6E2D8] p-8 space-y-3">
          <p className="text-sm font-semibold text-[#15171A]">No analyses found</p>
          <p className="text-xs text-[#707582]">
            {searchQuery
              ? `No records matched query "${searchQuery}".`
              : "Perform your first image, voice, or kinesic scan to populate your unified history."}
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/image")}
            className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Analyze an Image</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isSelected = selectedForCompare.includes(item.id);
            const dateStr = new Date(item.timestamp || item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-[#15171A] ${
                  isSelected ? "border-[#15171A] ring-1 ring-[#15171A]/20" : "border-[#E6E2D8]"
                }`}
              >
                {/* Left: Thumbnail & Main Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail or Modality Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#14161B] shrink-0 border border-[#DDD8CD] flex items-center justify-center">
                    {item.fileUrl || item.imageUrl || item.inputUrl ? (
                      <img
                        src={item.fileUrl || item.imageUrl || item.inputUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white p-2">
                        {getModalityIcon(item.type)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-[#FAF8F5] border border-[#DDD8CD]">
                        {getModalityIcon(item.type)}
                      </span>
                      <h3 className="text-xs font-bold text-[#15171A] truncate">{item.title}</h3>
                      <span className="text-[10px] font-mono text-[#8C8983] shrink-0">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#707582] truncate">
                      {item.qualityReason || item.context || "Multimodal signal record calibrated against baseline."}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex flex-wrap items-center gap-6 text-xs shrink-0">
                  <div>
                    <span className="text-[10px] text-[#707582] block">Emotion</span>
                    <span className="font-semibold text-[#15171A]">{item.emotion || "Calm"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#707582] block">Confidence</span>
                    <span className="font-mono font-bold text-[#10B981]">{item.confidence}%</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#707582] block">Vibe</span>
                    <span className="font-medium text-[#15171A]">{item.vibe || "Authentic"}</span>
                  </div>

                  {/* Compare Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("vibelens_compare_ids", JSON.stringify([item.id]));
                      onNavigate("/compare");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer bg-[#FAF8F5] text-[#15171A] border-[#DDD8CD] hover:bg-[#15171A] hover:text-white hover:border-[#15171A]"
                    title="Compare this session against baseline"
                  >
                    Compare
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg text-[#8C8983] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
