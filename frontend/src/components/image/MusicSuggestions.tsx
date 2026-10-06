import React, { useState, useEffect } from "react";
import { Music, Disc, Volume2, X, RefreshCw } from "lucide-react";
import { imageAnalysisApi, MusicRecommendation } from "../../services/imageAnalysisApi";

interface MusicSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
}

export const MusicSuggestions: React.FC<MusicSuggestionsProps> = ({
  isOpen,
  onClose,
  analysisId,
  emotion,
  vibe,
  scene,
}) => {
  const [recommendation, setRecommendation] = useState<MusicRecommendation | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const res = await imageAnalysisApi.suggestMusic({
        analysisId,
        emotion,
        vibe,
        scene,
      });
      setRecommendation(res.recommendation);
      setDisclaimer(res.disclaimer);
    } catch (err) {
      console.warn("Error suggesting music:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMusic();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD8CD] w-full max-w-lg p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17191A] text-white flex items-center justify-center">
              <Music size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17191A]">Acoustic Vibe Match</h3>
              <p className="text-[11px] text-[#858881]">Audio pairing suggestions derived from visual energy</p>
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

        {loading || !recommendation ? (
          <div className="py-12 text-center text-xs text-[#858881] flex flex-col items-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[#17191A]" />
            <span>Harmonizing acoustic suggestions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Mood & Genre Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#DDD8CD] space-y-2 shadow-2xs">
              <div className="text-[11px] font-mono text-[#A97858] uppercase font-semibold">
                Recommended Acoustic Style
              </div>
              <div className="text-lg font-serif font-bold text-[#17191A]">
                {recommendation.mood}
              </div>
              <div className="text-xs text-[#555A58] font-sans flex items-center gap-2">
                <span className="font-semibold text-[#17191A]">{recommendation.genre}</span>
                <span>&bull;</span>
                <span>{recommendation.tempo}</span>
                <span>&bull;</span>
                <span>{recommendation.energy}</span>
              </div>
            </div>

            {/* Representative Tracks */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#17191A]">
                Representative Aesthetic Tracks
              </div>
              <div className="space-y-2">
                {recommendation.suggestedStyleTracks.map((track) => (
                  <div
                    key={track.title}
                    className="p-3 rounded-xl bg-white border border-[#DDD8CD]/80 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#DDD8CD] flex items-center justify-center text-[#17191A] flex-shrink-0 mt-0.5">
                        <Disc size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#17191A]">{track.title}</div>
                        <div className="text-[11px] text-[#858881]">{track.artist}</div>
                        <div className="text-[10px] text-[#30483E] font-mono pt-0.5">
                          {track.aestheticMatch}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening note & disclaimer */}
            <div className="p-3 rounded-xl bg-[#EFE9DE]/50 border border-[#DDD8CD]/70 space-y-1 text-[11px] text-[#555A58] leading-relaxed">
              <p className="font-medium text-[#17191A]">&ldquo;{recommendation.listeningNote}&rdquo;</p>
              <p className="text-[10px] text-[#858881] italic">{disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
