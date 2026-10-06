import React, { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, X, Trash2 } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  onChangeImage: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fileName,
  fileSize,
  mimeType = "image/jpeg",
  width,
  height,
  onChangeImage,
  disabled = false,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="rounded-3xl border border-[#DDD8CD] bg-white p-5 space-y-4 shadow-2xs select-none">
      {/* Top bar with file metadata and Change Image */}
      <div className="flex items-center justify-between border-b border-[#DDD8CD]/50 pb-3">
        <div className="min-w-0 pr-2">
          <div className="font-sans font-bold text-xs sm:text-sm text-[#17191A] truncate max-w-[240px] sm:max-w-[320px]">
            {fileName}
          </div>
          <div className="text-[11px] text-[#858881] flex items-center gap-2 mt-0.5 font-mono">
            <span>{formatFileSize(fileSize)}</span>
            <span>&bull;</span>
            <span>{mimeType.split("/")[1]?.toUpperCase() || "JPG"}</span>
            {width && height && (
              <>
                <span>&bull;</span>
                <span>{width}×{height}</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeImage}
          disabled={disabled}
          className="px-3.5 py-1.5 rounded-full border border-[#DDD8CD] hover:border-[#17191A] bg-white text-[#17191A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <Trash2 size={13} className="text-[#858881]" />
          <span>Change image</span>
        </button>
      </div>

      {/* Main Image Viewport with quick zoom overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-[#F6F3EC] border border-[#DDD8CD]/80 aspect-[16/10] sm:aspect-[16/9] group">
        <img
          src={imageUrl}
          alt="Selected visual signal target"
          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
        />

        {/* Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs flex items-center gap-1.5 transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
          title="Open Lightbox Zoom"
        >
          <Maximize2 size={13} />
          <span className="text-[11px] font-medium pr-0.5">Zoom</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Controls Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white border-b border-white/20 pb-3">
            <div className="text-xs font-medium text-white/80 truncate max-w-xs">{fileName}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 ml-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                title="Close Lightbox"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lightbox Image Container */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
            <img
              src={imageUrl}
              alt="Fullscreen Preview"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg transition-transform duration-150"
            />
          </div>

          <div className="text-[11px] text-white/50 pb-1">
            Press ESC or click close to exit lightbox
          </div>
        </div>
      )}
    </div>
  );
};
