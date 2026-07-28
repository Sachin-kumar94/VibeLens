import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  Trash2, 
  Clock, 
  Activity, 
  AlertCircle,
  TrendingUp,
  Heart,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { FusionAnalysis } from "../types";
import { EmojiInsights } from "./EmojiInsights";

interface FusionPanelProps {
  isDark: boolean;
  onAnalysisSuccess: () => void;
  language?: string;
}

export const FusionPanel: React.FC<FusionPanelProps> = ({ isDark, onAnalysisSuccess, language = "English" }) => {
  const [history, setHistory] = useState<FusionAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FusionAnalysis | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history/fusion");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        if (data.history.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(data.history[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load fusion history:", err);
    }
  };

  const handleCompileFusion = async () => {
    setLoading(true);
    setWarningMessage(null);
    try {
      const res = await fetch("/api/analyze/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedAnalysis(data.result);
        if (data.warning) {
          setWarningMessage(data.warning);
        }
        await fetchHistory();
        onAnalysisSuccess();
      } else {
        alert(data.error || "Multimodal synthesis compilation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to compile cognitive fusion synthesis.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this fusion analysis report?")) return;
    try {
      const res = await fetch(`/api/history/fusion/${id}`, { method: "DELETE" });
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="fusion-tab-dashboard">
      
      {/* LEFT COLUMN: SYNTHESIS CONTROLLER & HISTORY */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Synthesis Engine Trigger Card */}
        <div className={`p-6 rounded-3xl border text-center space-y-5 ${
          isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"
        }`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-violet-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/20">
            <Brain size={28} className="animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold font-display tracking-tight">AI Multimodal Fusion Engine</h2>
            <p className="text-[11px] opacity-60 max-w-xs mx-auto leading-relaxed">
              Compile Face emotion coordinates, Vocal acoustic waveforms, and somatic Posture indicators into a unified composite Emotional Intelligence (EI) index.
            </p>
          </div>

          <button
            onClick={handleCompileFusion}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow shadow-purple-500/15 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Cpu size={14} />
            <span>Generate Cognitive Synthesis</span>
          </button>

          <p className="text-[9px] opacity-40 font-mono">
            Requires at least one visual, acoustic, or somatic log in memory cache.
          </p>
        </div>

        {/* Warning card if sandbox/fallback mode active */}
        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2.5 text-xs">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed text-[11px] font-medium">{warningMessage}</p>
          </div>
        )}

        {/* Synthesis reports history tree */}
        <div className={`p-4 rounded-3xl border space-y-3 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold font-display uppercase tracking-wider opacity-60">Synthesis Reports</span>
            <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/10 px-2 py-0.5 rounded-full font-bold">{history.length} reports</span>
          </div>

          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-[10px] font-mono">No synthesized reports available.</div>
            ) : (
              history.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedAnalysis?.id === item.id 
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                      : isDark ? "bg-black/30 border-white/5 hover:bg-white/5 text-slate-300" : "bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                      {item.ei_score}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Vibe: {item.overall_vibe}</span>
                        <span className="text-[9px] opacity-60 font-mono">({(item.confidence * 100).toFixed(0)}% Conf)</span>
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

      {/* RIGHT COLUMN: MULTIMODAL COGNITION COCKPIT */}
      <div className="xl:col-span-7">
        {loading ? (
          <div className={`h-full min-h-[460px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
            isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"
          }`}>
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-purple-500 border-r-pink-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-sm font-bold font-display">Activating Multimodal Synapses</h3>
            <p className="text-xs opacity-60 max-w-xs mt-1">Sieving through acoustic, visual, and posture telemetry caches to generate compound EI scoring matrices...</p>
          </div>
        ) : selectedAnalysis ? (
          <div className="space-y-6">
            
            {/* Compound Emotional Intelligence Score Ring Card */}
            <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
                <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">Unified Cognitive Dashboard</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono uppercase tracking-wider text-[9px] font-bold">
                  <ShieldCheck size={11} />
                  <span>Pipeline Cleared</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Massive circular progress indicator */}
                <div className="md:col-span-5 text-center space-y-3">
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="62" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="10" fill="transparent" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="62" 
                        stroke="url(#fusionGrad)" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray="389"
                        strokeDashoffset={389 - (389 * (selectedAnalysis.ei_score / 100))}
                        strokeLinecap="round"
                        className="drop-shadow-[0_2px_12px_rgba(168,85,247,0.3)]"
                      />
                      <defs>
                        <linearGradient id="fusionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-display tracking-tight leading-none text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
                        {selectedAnalysis.ei_score}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-mono opacity-60 block mt-1.5">Composite EI Score</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold bg-white/5 dark:bg-black/40 border border-white/5 px-3 py-1 rounded-full text-purple-400">
                      Vibe: {selectedAnalysis.overall_vibe.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Cognitive Synthesis Breakdown right */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold font-display text-purple-400 mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>Synthesized Cognitive Assessment</span>
                    </h3>
                    <p className="text-xs opacity-80 leading-relaxed italic">
                      "{selectedAnalysis.explanation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                    <div className={`p-3 rounded-xl border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <span className="text-[9px] opacity-50 uppercase tracking-wider block font-mono mb-0.5">Fusion Confidence</span>
                      <span className="font-bold text-emerald-500">{(selectedAnalysis.confidence * 100).toFixed(0)}% Match</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <span className="text-[9px] opacity-50 uppercase tracking-wider block font-mono mb-0.5">Physical Posture</span>
                      <span className="font-bold text-pink-500">{selectedAnalysis.body_state}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Emoji Response Insights */}
            <EmojiInsights isDark={isDark} type="fusion" data={selectedAnalysis} />

            {/* Matrix Streams Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Audio & Visual streams card */}
              <div className={`p-5 rounded-3xl border space-y-4.5 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                    <Activity size={14} />
                    <span>Audio/Visual Streams</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Ingested</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="opacity-60 font-medium">Face Detected Vibe:</span>
                    <span className="font-bold text-slate-200 dark:text-white">{selectedAnalysis.face_emotion} ({(selectedAnalysis.face_confidence * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="opacity-60 font-medium">Vocal Cadence Vibe:</span>
                    <span className="font-bold text-purple-400">{selectedAnalysis.voice_emotion} ({(selectedAnalysis.voice_confidence * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="opacity-60 font-medium">Scene Geometry:</span>
                    <span className="font-bold text-amber-500 truncate max-w-[150px]">{selectedAnalysis.scene_type}</span>
                  </div>
                </div>
              </div>

              {/* Cognitive coaching feedback block */}
              <div className={`p-5 rounded-3xl border space-y-3 ${isDark ? "bg-white/5 border-white/10 animate-glow" : "bg-white border-gray-100 shadow-sm"}`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 text-pink-400">
                    <Heart size={14} />
                    <span>Presenter EI Feedback</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-50 font-bold text-pink-400">PRO GRADE</span>
                </div>

                <p className="text-xs opacity-75 leading-relaxed">
                  Your current presentation posture aligns beautifully with your vocal confidence registers. 
                  Maintaining an index of <span className="font-semibold text-emerald-400">{selectedAnalysis.ei_score}</span> projects deep focus, emotional openness, and persuasive communicative leadership.
                </p>
                <div className="pt-1.5">
                  <span className="text-[10px] text-purple-400 font-mono font-bold flex items-center gap-1 cursor-pointer hover:underline">
                    <span>Unlock premium micro-coaching directives</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className={`h-full min-h-[460px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
            isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"
          }`}>
            <Brain size={36} className="text-purple-400 opacity-40 mb-3" />
            <h3 className="text-sm font-bold font-display">Fusion EI Synthesis Cockpit</h3>
            <p className="text-xs opacity-60 max-w-sm mt-1">Compile your Face visual logs, Voice wave parameters, and Posture frame caches to run deep multi-stream emotional intelligence reports.</p>
          </div>
        )}
      </div>

    </div>
  );
};
