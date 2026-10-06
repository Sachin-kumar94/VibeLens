import React, { useState, useEffect } from "react";
import { Hash, Copy, Check, RefreshCw, X } from "lucide-react";
import { imageAnalysisApi, HashtagGroup } from "../../services/imageAnalysisApi";

interface HashtagGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
}

export const HashtagGenerator: React.FC<HashtagGeneratorProps> = ({
  isOpen,
  onClose,
  analysisId,
  emotion,
  vibe,
  scene,
}) => {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [copyAllString, setCopyAllString] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  const fetchHashtags = async () => {
    setLoading(true);
    try {
      const res = await imageAnalysisApi.generateHashtags({
        analysisId,
        emotion,
        vibe,
        scene,
      });
      setGroups(res.groups || []);
      setCopyAllString(res.copyAllString || "");
    } catch (err) {
      console.warn("Error generating hashtags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHashtags();
    }
  }, [isOpen]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(copyAllString);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedSingle(tag);
    setTimeout(() => setCopiedSingle(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD8CD] w-full max-w-lg p-6 space-y-5 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17191A] text-white flex items-center justify-center">
              <Hash size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17191A]">Hashtag Discovery</h3>
              <p className="text-[11px] text-[#858881]">Semantic tags grouped by contextual theme</p>
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

        {loading ? (
          <div className="py-12 text-center text-xs text-[#858881] flex flex-col items-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[#17191A]" />
            <span>Discovering relevant hashtags...</span>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.category} className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#858881]">
                    {group.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleCopyTag(tag)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD8CD] text-xs font-mono text-[#17191A] hover:border-[#17191A] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>{tag}</span>
                        {copiedSingle === tag ? (
                          <Check size={11} className="text-[#30483E]" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DDD8CD]/60">
              <span className="text-[11px] text-[#858881]">Click any tag to copy individually</span>
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-4 py-2 rounded-xl bg-[#17191A] hover:bg-[#2A2E2C] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedAll ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedAll ? "Copied All" : "Copy All Tags"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
