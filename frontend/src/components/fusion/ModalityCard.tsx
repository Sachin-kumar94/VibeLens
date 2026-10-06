import React, { useRef } from "react";
import {
  Image as ImageIcon,
  Mic,
  Activity,
  Camera,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";

export interface ConnectedSignalData {
  sourceType: "capture" | "upload" | "history" | "studio";
  analysisId?: string;
  title: string;
  fileName?: string;
  previewUrl?: string;
  timestamp?: string;
  signalQuality: number; // 0-100
  confidence: number; // 0-100
  emotion?: string;
  tone?: string;
  vibe?: string;
  pace?: number;
  energy?: number;
  posture?: string;
  gaze?: string;
  rawPayload?: any;
}

export interface ModalityCardProps {
  modality: "image" | "voice" | "body";
  connectedSignal: ConnectedSignalData | null;
  onCaptureClick: () => void;
  onLiveCameraClick?: () => void;
  onUploadFile: (file: File) => void;
  onHistoryClick: () => void;
  onRemove: () => void;
  onChange: () => void;
}

export const ModalityCard: React.FC<ModalityCardProps> = ({
  modality,
  connectedSignal,
  onCaptureClick,
  onLiveCameraClick,
  onUploadFile,
  onHistoryClick,
  onRemove,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getModalityMeta = () => {
    switch (modality) {
      case "image":
        return {
          title: "IMAGE",
          subtitle: "Visual & Facial Affect",
          icon: ImageIcon,
          color: "text-[#3B82F6]",
          bgColor: "bg-[#3B82F6]/10",
          accept: "image/*",
        };
      case "voice":
        return {
          title: "VOICE",
          subtitle: "Acoustic Prosody & Cadence",
          icon: Mic,
          color: "text-[#8B5CF6]",
          bgColor: "bg-[#8B5CF6]/10",
          accept: "audio/*",
        };
      case "body":
        return {
          title: "BODY",
          subtitle: "Postural Kinesics Alignment",
          icon: Activity,
          color: "text-[#10B981]",
          bgColor: "bg-[#10B981]/10",
          accept: "image/*,video/*",
        };
    }
  };

  const meta = getModalityMeta();
  const Icon = meta.icon;
  const isConnected = Boolean(connectedSignal);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between ${
        isConnected
          ? "bg-white border-[#15171A]/20 shadow-xs"
          : "bg-[#FAF8F5] border-[#E6E2D8] hover:border-[#DDD8CD]"
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={meta.accept}
        className="hidden"
      />

      {/* Top Bar: Title & Connection Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/60">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${meta.bgColor} flex items-center justify-center`}>
            <Icon size={16} className={meta.color} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#15171A] tracking-wider uppercase font-mono">
              {meta.title}
            </h3>
            <p className="text-[11px] text-[#707582]">{meta.subtitle}</p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#059669] text-[11px] font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Connected</span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-[#8C8983] px-2 py-0.5 rounded-md bg-white border border-[#DDD8CD]">
            Not connected
          </span>
        )}
      </div>

      {/* Middle Body */}
      <div className="py-4 flex-1">
        {isConnected && connectedSignal ? (
          /* Connected Preview View */
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {connectedSignal.previewUrl ? (
                <div className="relative w-14 h-18 rounded-xl overflow-hidden border border-[#DDD8CD] bg-black shrink-0">
                  <img
                    src={connectedSignal.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/70 text-white px-1 rounded-sm">
                    9:16
                  </span>
                </div>
              ) : (
                <div className={`w-14 h-14 rounded-2xl ${meta.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={meta.color} />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-[#15171A] truncate">
                    {connectedSignal.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#059669] font-bold shrink-0">
                    Quality {connectedSignal.signalQuality}%
                  </span>
                </div>

                <p className="text-[11px] text-[#525866] truncate">
                  {modality === "image" && (
                    <span>{connectedSignal.emotion || "Composed & Attentive"}</span>
                  )}
                  {modality === "voice" && (
                    <span>
                      {connectedSignal.tone || connectedSignal.emotion || "Measured Cadence"}
                      {connectedSignal.pace ? ` · ${connectedSignal.pace} WPM` : ""}
                    </span>
                  )}
                  {modality === "body" && (
                    <span>
                      {connectedSignal.posture || "Upright Posture"} · {connectedSignal.gaze || "Direct Gaze"}
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-[#8C8983]">
                  <span className="capitalize font-mono">
                    Source: {connectedSignal.sourceType === "capture" ? "New Capture" : "History"}
                  </span>
                  <span>·</span>
                  <span>Confidence {connectedSignal.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Disconnected State */
          <div className="py-2 space-y-1 text-center sm:text-left">
            <p className="text-xs font-medium text-[#15171A]">
              Choose a signal source to connect
            </p>
            <p className="text-[11px] text-[#707582] leading-relaxed">
              Capture a new portrait photo, record live speech, or select from your previous analyses.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-[#E6E2D8]/60">
        {isConnected ? (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onChange}
              className="flex items-center gap-1 text-xs font-semibold text-[#15171A] hover:underline cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Change</span>
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          /* Disconnected Buttons Group */
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onCaptureClick}
              className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {modality === "voice" ? <Mic size={13} /> : <Camera size={13} />}
              <span>{modality === "voice" ? "Record Voice" : "Capture Portrait"}</span>
            </button>

            {modality === "body" && onLiveCameraClick && (
              <button
                type="button"
                onClick={onLiveCameraClick}
                className="px-2.5 py-2 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] transition cursor-pointer"
                title="Live Stream Pose"
              >
                <span>Live Cam</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-2 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] transition cursor-pointer flex items-center gap-1"
              title="Upload File"
            >
              <Upload size={13} className="text-[#707582]" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={onHistoryClick}
              className="px-2.5 py-2 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] transition cursor-pointer flex items-center gap-1"
              title="Select From History"
            >
              <Clock size={13} className="text-[#707582]" />
              <span>History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
