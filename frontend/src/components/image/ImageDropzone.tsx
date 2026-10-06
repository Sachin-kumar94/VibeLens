import React, { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageDropzoneProps {
  onFileSelected: (file: File) => void;
  onCameraClick: () => void;
  onDemoClick: () => void;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFileSelected,
  onCameraClick,
  onDemoClick,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMessage(null);

    // MIME type validation
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG or WEBP image.");
      return;
    }

    // Size validation (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage("This image is larger than 10 MB. Please choose a smaller image.");
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          validateAndHandleFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled]);

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#C23B22] text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={16} className="flex-shrink-0 text-[#C23B22]" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload an image"
        className={`relative rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 outline-none select-none border-2 border-dashed ${
          isDragging
            ? "border-[#17191A] bg-[#EFE9DE]/80 scale-[1.008]"
            : "border-[#DDD8CD] bg-[#FAF8F5] hover:border-[#17191A] hover:bg-[#F6F3EC]"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#DDD8CD] flex items-center justify-center mx-auto mb-4 text-[#555A58] shadow-2xs group-hover:scale-105 transition-transform">
          <ImageIcon size={26} strokeWidth={1.75} />
        </div>

        <div className="text-sm sm:text-base font-bold text-[#17191A]">
          {isDragging ? "Drop your image here" : "Drag & drop an image here"}
        </div>
        <div className="text-xs sm:text-[13px] text-[#555A58] mt-1">
          or <span className="underline font-semibold text-[#17191A]">click to browse files</span>
        </div>

        <div className="text-[11px] text-[#858881] font-mono mt-3">
          Supported: JPG, PNG, WEBP &bull; Max 10MB
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Alternative actions: Paste prompt, Camera, and Demo insight */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#555A58]">
        <span className="text-[11px] text-[#858881]">
          Tip: You can also paste directly from your clipboard (<kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DDD8CD] text-[10px] font-mono text-[#17191A]">Ctrl+V</kbd>)
        </span>

        <button
          type="button"
          onClick={onDemoClick}
          className="text-xs text-[#A97858] hover:text-[#8D6246] font-semibold underline underline-offset-2 cursor-pointer transition-colors"
        >
          Explore with Demo Image →
        </button>
      </div>
    </div>
  );
};
