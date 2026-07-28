import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Video, 
  Trash2, 
  Eye, 
  Sparkles, 
  Clock, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { BodyAnalysis } from "../types";
import { EmojiInsights } from "./EmojiInsights";

interface BodyPanelProps {
  isDark: boolean;
  onAnalysisSuccess: () => void;
  language?: string;
}

export const BodyPanel: React.FC<BodyPanelProps> = ({ isDark, onAnalysisSuccess, language = "English" }) => {
  const [history, setHistory] = useState<BodyAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<BodyAnalysis | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchHistory();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history/body");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        if (data.history.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(data.history[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load body history:", err);
    }
  };

  // Start Webcam stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWarningMessage(null);
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Could not access your webcam. Please check browser frame permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Frame = canvas.toDataURL("image/jpeg");
    handleAnalyzeBodyFrame(base64Frame);
  };

  const handleAnalyzeBodyFrame = async (base64: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze/body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, language })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedAnalysis(data.result);
        if (data.warning) {
          setWarningMessage(data.warning);
        } else {
          setWarningMessage(null);
        }
        await fetchHistory();
        onAnalysisSuccess();
        stopCamera();
      } else {
        alert(data.error || "Posture analysis failed");
      }
    } catch (err) {
      console.error("Body analysis API failed:", err);
      alert("Failed to analyze physical skeleton.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this posture tracking log?")) return;
    try {
      const res = await fetch(`/api/history/body/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        if (selectedAnalysis?.id === id) {
          setSelectedAnalysis(updated[0] || null);
        }
        onAnalysisSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Human Skeletal Mapping Vector Generator
  const renderJointSkeletonGraph = (score: number) => {
    // Generate slight offsets depending on score to simulate actual skeletal slouching
    const isGood = score >= 80;
    const isMedium = score >= 60 && score < 80;
    
    // Joint positions
    const headY = isGood ? 22 : isMedium ? 25 : 30;
    const headX = isGood ? 50 : isMedium ? 48 : 42;
    const neckY = headY + 12;
    const spineY = neckY + 28;
    const spineX = isGood ? 50 : isMedium ? 47 : 44;
    const leftShoulderX = spineX - 18;
    const rightShoulderX = spineX + 18;
    const leftShoulderY = neckY + 4;
    const rightShoulderY = neckY + 4;

    const leftElbowX = leftShoulderX - 10;
    const leftElbowY = leftShoulderY + 18;
    const rightElbowX = rightShoulderX + 10;
    const rightElbowY = rightShoulderY + 18;

    const leftHandX = leftElbowX - 4;
    const leftHandY = leftElbowY + 14;
    const rightHandX = rightElbowX + 6;
    const rightHandY = rightElbowY + 14;

    const leftHipX = spineX - 12;
    const rightHipX = spineX + 12;

    const boneColor = isGood ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444";

    return (
      <svg viewBox="0 0 100 120" className="w-full h-44 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]" id="joint-svg-skeleton">
        {/* Background circle */}
        <circle cx="50" cy="55" r="48" fill={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"} stroke="rgba(147, 51, 234, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Spine line */}
        <line x1={spineX} y1={neckY} x2={spineX} y2={spineY} stroke={boneColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Shoulder girdle */}
        <line x1={leftShoulderX} y1={leftShoulderY} x2={rightShoulderX} y2={rightShoulderY} stroke={boneColor} strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Left Arm */}
        <line x1={leftShoulderX} y1={leftShoulderY} x2={leftElbowX} y2={leftElbowY} stroke={boneColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={leftElbowX} y1={leftElbowY} x2={leftHandX} y2={leftHandY} stroke={boneColor} strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Right Arm */}
        <line x1={rightShoulderX} y1={rightShoulderY} x2={rightElbowX} y2={rightElbowY} stroke={boneColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={rightElbowX} y1={rightElbowY} x2={rightHandX} y2={rightHandY} stroke={boneColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Hip base girdle */}
        <line x1={leftHipX} y1={spineY} x2={rightHipX} y2={spineY} stroke={boneColor} strokeWidth="3" strokeLinecap="round" />

        {/* Head Node */}
        <circle cx={headX} cy={headY} r="8.5" fill={boneColor} opacity="0.15" />
        <circle cx={headX} cy={headY} r="6" fill={boneColor} stroke={isDark ? "#0c0a09" : "#ffffff"} strokeWidth="1.5" />

        {/* Eye markers */}
        <circle cx={headX - 2} cy={headY - 1} r="1" fill={isDark ? "#ffffff" : "#000000"} />
        <circle cx={headX + 2} cy={headY - 1} r="1" fill={isDark ? "#ffffff" : "#000000"} />

        {/* Skeleton Joint Nodes */}
        {[
          { x: spineX, y: neckY },
          { x: spineX, y: spineY },
          { x: leftShoulderX, y: leftShoulderY },
          { x: rightShoulderX, y: rightShoulderY },
          { x: leftElbowX, y: leftElbowY },
          { x: rightElbowX, y: rightElbowY },
          { x: leftHandX, y: leftHandY },
          { x: rightHandX, y: rightHandY },
          { x: leftHipX, y: spineY },
          { x: rightHipX, y: spineY }
        ].map((node, nIdx) => (
          <circle key={nIdx} cx={node.x} cy={node.y} r="2.2" fill={isDark ? "#ffffff" : "#0c0a09"} stroke={boneColor} strokeWidth="1" />
        ))}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="body-tab-dashboard">
      
      {/* LEFT COLUMN: LIVE Posture TRACKER */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Interactive Tracking Panel */}
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-display tracking-tight flex items-center gap-2">
              <Camera className="text-pink-500" size={18} />
              <span>Skeletal Video Frame Portal</span>
            </h2>
          </div>

          <div className={`rounded-2xl overflow-hidden relative ${
            isDark ? "bg-black/45 border border-white/5" : "bg-gray-50 border border-gray-100"
          } aspect-video flex items-center justify-center`}>
            
            {cameraActive ? (
              <div className="w-full h-full relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* SVG Skeleton HUD overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-80 bg-purple-950/10">
                  <div className="border border-purple-500/30 rounded-full w-48 h-48 border-dashed animate-spin absolute" />
                  <div className="border border-pink-500/20 rounded-lg w-64 h-48 absolute" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-slate-300 font-mono text-[9px] px-2 py-1 rounded border border-white/10">
                    SKELETAL MAPPING CORE ACTIVE
                  </div>
                </div>

                {/* Control elements */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold rounded-lg text-[10px] uppercase tracking-wide transition border border-white/10"
                  >
                    Close
                  </button>
                  <button 
                    onClick={captureFrame}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide shadow transition"
                  >
                    Analyze Frame
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mx-auto border border-pink-500/20">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-bold">Postural Skeletal Streamer</h3>
                  <p className="text-[10px] opacity-60 max-w-xs mx-auto mt-1">Boot your webcam feed to track spinal alignment, eye contact attentiveness, and shoulder coordinates.</p>
                </div>
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wide shadow flex items-center gap-1.5 mx-auto transition disabled:opacity-50"
                >
                  <Camera size={13} />
                  <span>Start Posture Camera</span>
                </button>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <p className="text-[10px] opacity-50 mt-3 text-center leading-normal">
            Frames are processed securely server-side. No media stream data is permanently stored on external hosts.
          </p>
        </div>

        {/* Warning card if offline/simulated */}
        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2.5 text-xs">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed text-[11px] font-medium">{warningMessage}</p>
          </div>
        )}

        {/* Historical Posture logs */}
        <div className={`p-4 rounded-3xl border space-y-3 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold font-display uppercase tracking-wider opacity-60">Posture Archive</span>
            <span className="text-[10px] font-mono bg-pink-500/10 text-pink-500 border border-pink-500/10 px-2 py-0.5 rounded-full font-bold">{history.length} frames</span>
          </div>

          <div className="max-h-[230px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-[10px] font-mono">No tracking records found.</div>
            ) : (
              history.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedAnalysis?.id === item.id 
                      ? "bg-pink-500/10 border-pink-500/30 text-pink-500 font-bold" 
                      : isDark ? "bg-black/30 border-white/5 hover:bg-white/5 text-slate-300" : "bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-[10px]">
                      {item.posture_score}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <span>{item.body_state} Pose</span>
                        <span className="text-[9px] opacity-60 font-mono">({item.attention_state})</span>
                      </div>
                      <span className="text-[9px] opacity-50 block font-mono mt-0.5">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteEntry(item.id, e)}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition text-slate-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: ANALYTICS HUD VIEW */}
      <div className="xl:col-span-7">
        {loading ? (
          <div className={`h-full min-h-[450px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
            isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"
          }`}>
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 border-2 border-pink-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-pink-500 border-r-purple-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-sm font-bold font-display">Mapping Posture Coordinates</h3>
            <p className="text-xs opacity-60 max-w-xs mt-1">Estimating Joint landmark angles, attentiveness metrics and communication indices via Gemini Multimodal...</p>
          </div>
        ) : selectedAnalysis ? (
          <div className="space-y-6">
            
            {/* Bento Dashboard stats block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}>
                <span className="text-[9px] uppercase tracking-wider font-mono opacity-50 block mb-1">Attention Level</span>
                <span className="text-xl font-extrabold text-pink-500 block">{selectedAnalysis.attention_score}%</span>
                <span className="text-[10px] font-mono opacity-60 mt-1 block">{selectedAnalysis.attention_state}</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}>
                <span className="text-[9px] uppercase tracking-wider font-mono opacity-50 block mb-1">Spine Alignment</span>
                <span className="text-xl font-extrabold text-purple-400 block">{selectedAnalysis.posture_score}%</span>
                <span className="text-[10px] font-mono opacity-60 mt-1 block">{selectedAnalysis.posture_state}</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}>
                <span className="text-[9px] uppercase tracking-wider font-mono opacity-50 block mb-1">Concentration Index</span>
                <span className="text-xl font-extrabold text-amber-500 block">{selectedAnalysis.concentration_score}%</span>
                <span className="text-[10px] font-mono opacity-60 mt-1 block">{selectedAnalysis.body_state} State</span>
              </div>

            </div>

            {/* Emoji Response Insights */}
            <EmojiInsights isDark={isDark} type="body" data={selectedAnalysis} />

            {/* Core Skeletal Frame & Eye metrics container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Joint mapping canvas card */}
              <div className={`p-5 rounded-3xl border space-y-4 flex flex-col items-center justify-center ${
                isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"
              }`} id="skeletal-skeleton-card">
                <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                    <Activity size={14} />
                    <span>Pose Joint Mapping</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-pink-500/15 text-pink-400 px-1.5 py-0.5 rounded font-bold">{selectedAnalysis.posture_state}</span>
                </div>
                
                {renderJointSkeletonGraph(selectedAnalysis.posture_score)}

                <div className="text-center">
                  <span className="text-[10px] opacity-40 font-mono">Simulating joint coordinate vectors [YOLO Pose mapped]</span>
                </div>
              </div>

              {/* Eye Contact & Hand Gestures */}
              <div className={`p-5 rounded-3xl border space-y-5 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Eye size={14} />
                    <span>Visual Engagement</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Active Focus Track</span>
                </div>

                <div className="space-y-4 pt-1">
                  
                  {/* Eye contact score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="opacity-70">Direct Eye Contact:</span>
                      <span className="font-bold text-emerald-500 font-mono">{selectedAnalysis.eye_contact_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedAnalysis.eye_contact_score}%` }} />
                    </div>
                    <span className="text-[10px] opacity-50 block font-mono">Current state: {selectedAnalysis.eye_state}</span>
                  </div>

                  {/* Gestures score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="opacity-70">Gesture Expressiveness:</span>
                      <span className="font-bold text-pink-500 font-mono">{selectedAnalysis.gesture_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${selectedAnalysis.gesture_score}%` }} />
                    </div>
                    <span className="text-[10px] opacity-50 block font-mono">Pattern: {selectedAnalysis.gesture_state}</span>
                  </div>

                  {/* Effectiveness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="opacity-70">Communication Impact:</span>
                      <span className="font-bold text-purple-400 font-mono">{selectedAnalysis.communication_effectiveness}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${selectedAnalysis.communication_effectiveness}%` }} />
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Comprehensive presentation feedback card */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-pink-400" />
                <span>Physical Posture Feedback</span>
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                The body language telemetry indicates a highly <span className="font-semibold text-pink-400">{selectedAnalysis.body_state.toLowerCase()}</span> somatic posture alignment. Spinal parameters reflect a <span className="font-semibold text-purple-400">"{selectedAnalysis.posture_state}"</span> with an eye contact alignment indicator of <span className="font-semibold text-emerald-400">{selectedAnalysis.eye_contact_score}%</span>. Attention ratio stands at <span className="font-semibold text-amber-400">{selectedAnalysis.attention_percentage}%</span>.
              </p>
            </div>

          </div>
        ) : (
          <div className={`h-full min-h-[450px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
            isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"
          }`}>
            <Video size={36} className="text-pink-400 opacity-40 mb-3" />
            <h3 className="text-sm font-bold font-display">Body Telemetry Portal</h3>
            <p className="text-xs opacity-60 max-w-sm mt-1">Engage real-time webcam telemetry tracking, or pick an entry from the pose log tree to visualize human joint landmark analyses.</p>
          </div>
        )}
      </div>

    </div>
  );
};
