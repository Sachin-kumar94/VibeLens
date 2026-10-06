import React, { useState, useEffect } from "react";
import { Sparkles, Copy, Check, RefreshCw, X, Globe } from "lucide-react";
import { imageAnalysisApi, CaptionOption } from "../../services/imageAnalysisApi";

interface CaptionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
  onOpenTranslate?: (text: string) => void;
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({
  isOpen,
  onClose,
  analysisId,
  emotion,
  vibe,
  scene,
  onOpenTranslate,
}) => {
  const [platform, setPlatform] = useState<"Instagram" | "LinkedIn" | "Story">("Instagram");
  const [captions, setCaptions] = useState<CaptionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCaptions = async () => {
    setLoading(true);
    try {
      const res = await imageAnalysisApi.generateCaptions({
        analysisId,
        emotion,
        vibe,
        scene,
        platform,
      });
      setCaptions(res.captions || []);
    } catch (err) {
      console.warn("Error generating captions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptions();
    }
  }, [isOpen, platform]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD8CD] w-full max-w-xl p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17191A] text-white flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17191A]">Caption Studio</h3>
              <p className="text-[11px] text-[#858881]">Curated for human tone & visual resonance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE9DE] text-[#555A58] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Switcher */}
        <div className="flex items-center gap-2">
          {(["Instagram", "LinkedIn", "Story"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                platform === p
                  ? "bg-[#17191A] text-white"
                  : "bg-white border border-[#DDD8CD] text-[#555A58] hover:border-[#17191A]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchCaptions}
            disabled={loading}
            className="ml-auto p-1.5 rounded-full border border-[#DDD8CD] hover:border-[#17191A] text-[#17191A] bg-white transition cursor-pointer disabled:opacity-50"
            title="Regenerate Captions"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Captions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#858881] flex flex-col items-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[#17191A]" />
              <span>Synthesizing tailored captions...</span>
            </div>
          ) : (
            captions.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-[#DDD8CD]/80 space-y-2.5 shadow-2xs group hover:border-[#17191A] transition"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#858881]">
                  <span className="font-semibold text-[#A97858] uppercase">{c.tone}</span>
                  <span>{c.characterCount} chars</span>
                </div>

                <p className="text-xs sm:text-[13px] text-[#17191A] leading-relaxed font-sans select-text">
                  {c.text}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#DDD8CD]/40">
                  {onOpenTranslate && (
                    <button
                      type="button"
                      onClick={() => onOpenTranslate(c.text)}
                      className="px-3 py-1 rounded-lg border border-[#DDD8CD] hover:border-[#17191A] text-[11px] text-[#555A58] hover:text-[#17191A] flex items-center gap-1 transition cursor-pointer"
                    >
                      <Globe size={12} />
                      <span>Translate</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(c.text, c.id)}
                    className="px-3 py-1 rounded-lg bg-[#17191A] hover:bg-[#2A2E2C] text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedId === c.id ? (
                      <>
                        <Check size={12} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
