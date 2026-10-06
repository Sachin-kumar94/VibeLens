import React, { useState, useRef } from "react";
import { Upload, FileAudio, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface VoiceUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const VoiceUpload: React.FC<VoiceUploadProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedExtensions = [".wav", ".mp3", ".webm", ".ogg", ".m4a", ".aac", ".flac"];
  const maxSizeBytes = 30 * 1024 * 1024; // 30 MB

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);

    const nameLower = file.name.toLowerCase();
    const isExtensionValid = allowedExtensions.some((ext) => nameLower.endsWith(ext));
    const isMimeValid = file.type.startsWith("audio/") || file.type.includes("webm") || file.type.includes("ogg");

    if (!isExtensionValid && !isMimeValid) {
      setErrorMessage(
        "Unsupported audio format. Please upload a WAV, MP3, WEBM, OGG, or M4A audio file."
      );
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage(
        "Audio file is larger than the 30 MB limit. Please choose a smaller audio file."
      );
      return;
    }

    if (file.size < 100) {
      setErrorMessage("The selected file appears to be empty or corrupted.");
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.webm,.ogg,.m4a"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload audio file"
        className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 focus:outline-none focus:ring-2 focus:ring-[#15171A] ${
          isDragging
            ? "border-[#10B981] bg-[#ECFDF5]/50 scale-[1.01]"
            : "border-[#DDD8CD] bg-[#FAF8F5] hover:border-[#8C8983] hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD8CD] text-[#575A60] flex items-center justify-center mx-auto shadow-2xs">
          <Upload size={20} className={isDragging ? "text-[#10B981]" : ""} />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#15171A]">
            <span className="underline underline-offset-2">Click to browse</span> or drag and drop an audio file
          </p>
          <p className="text-[11px] text-[#8C8983]">
            WAV, MP3, WEBM, OGG, or M4A (up to 30 MB)
          </p>
        </div>
      </div>

      {/* Inline Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
          <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
