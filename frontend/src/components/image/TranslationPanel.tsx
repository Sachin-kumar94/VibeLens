import React, { useState } from "react";
import { Globe, Copy, Check, X, RefreshCw } from "lucide-react";
import { imageAnalysisApi } from "../../services/imageAnalysisApi";

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}

const LANGUAGES = [
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Italian",
  "Portuguese",
  "Arabic",
];

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  isOpen,
  onClose,
  initialText,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (targetLang: string) => {
    setSelectedLanguage(targetLang);
    setLoading(true);
    try {
      const res = await imageAnalysisApi.translateCaption({
        text: initialText,
        targetLanguage: targetLang,
      });
      setTranslatedText(res.translatedText);
    } catch (err) {
      console.warn("Translation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && initialText) {
      handleTranslate(selectedLanguage);
    }
  }, [isOpen, initialText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText || initialText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#DDD8CD] w-full max-w-lg p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17191A] text-white flex items-center justify-center">
              <Globe size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17191A]">Caption Translation</h3>
              <p className="text-[11px] text-[#858881]">Nuanced multilingual expression</p>
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

        {/* Language Selection Pills */}
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => handleTranslate(lang)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedLanguage === lang
                  ? "bg-[#17191A] text-white font-semibold"
                  : "bg-white border border-[#DDD8CD] text-[#555A58] hover:border-[#17191A]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Translation Display */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#DDD8CD]/70 space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#858881]">Original (English)</div>
            <p className="text-xs text-[#555A58] leading-relaxed line-clamp-3">{initialText}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#17191A] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A97858] font-bold uppercase">
              <span>Translated to {selectedLanguage}</span>
              {loading && <RefreshCw size={11} className="animate-spin text-[#17191A]" />}
            </div>
            <p className="text-xs sm:text-sm text-[#17191A] leading-relaxed font-sans select-text">
              {loading ? "Translating caption with human nuance..." : translatedText}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDD8CD]/60">
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || !translatedText}
            className="px-4 py-2 rounded-xl bg-[#17191A] hover:bg-[#2A2E2C] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy Translated Caption"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
