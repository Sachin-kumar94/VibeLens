import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from "lucide-react";

interface PortraitCropToolProps {
  imageFile: File;
  onCropConfirm: (croppedBlob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

export const PortraitCropTool: React.FC<PortraitCropToolProps> = ({
  imageFile,
  onCropConfirm,
  onCancel,
}) => {
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const executeCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const targetW = 1080;
    const targetH = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill neutral dark background
    ctx.fillStyle = "#121316";
    ctx.fillRect(0, 0, targetW, targetH);

    // Compute relative scaling from crop container (320x568 approximate viewport)
    const containerW = 320;
    const containerH = 320 * (16 / 9); // ~568
    const scaleFactor = targetW / containerW;

    const renderedW = img.naturalWidth * (containerW / img.naturalWidth) * zoom * scaleFactor;
    const renderedH = img.naturalHeight * (containerW / img.naturalWidth) * zoom * scaleFactor;

    const centerX = targetW / 2 + panOffset.x * scaleFactor;
    const centerY = targetH / 2 + panOffset.y * scaleFactor;

    ctx.drawImage(
      img,
      centerX - renderedW / 2,
      centerY - renderedH / 2,
      renderedW,
      renderedH
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedUrl = URL.createObjectURL(blob);
          onCropConfirm(blob, croppedUrl);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [zoom, panOffset, onCropConfirm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#15171A]">Portrait Crop Alignment</h3>
          <p className="text-xs text-[#707582]">Position and zoom your photo to fit the 9:16 portrait frame.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-[#707582] hover:text-[#15171A] hover:bg-[#F4F1EA]"
        >
          <X size={16} />
        </button>
      </div>

      {/* 9:16 Interactive Crop Viewport */}
      <div
        className="relative mx-auto w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#121316] border-2 border-[#10B981] shadow-lg select-none cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {sourceUrl && (
          <img
            ref={imgRef}
            src={sourceUrl}
            alt="Crop source"
            draggable={false}
            className="absolute top-1/2 left-1/2 max-w-none transition-transform pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            }}
          />
        )}

        {/* Guide Grid */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
          <div className="border-r border-white/10" />
          <div className="border-r border-white/10" />
          <div />
        </div>

        {/* Framing Instructions */}
        <div className="absolute bottom-3 inset-x-3 flex justify-center pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-white/90 flex items-center gap-1.5">
            <Move size={12} />
            <span>Drag to center • Use zoom controls</span>
          </div>
        </div>
      </div>

      {/* Zoom & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-2 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-[#15171A] transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono text-[#707582] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
            className="p-2 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-[#15171A] transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-[#707582] hover:text-[#15171A] hover:bg-[#F4F1EA] transition cursor-pointer ml-1"
            title="Reset Position"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-medium text-[#707582] hover:text-[#15171A] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={executeCrop}
            className="px-4 py-2 rounded-xl bg-[#15171A] hover:bg-[#2A2E39] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Check size={14} />
            <span>Confirm 9:16 Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
