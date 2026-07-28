import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  History,
  BarChart3,
  User as UserIcon,
  Moon,
  Sun,
  Layers,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Music,
  RefreshCw,
  Search,
  Filter,
  Download,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  LogOut,
  Sliders,
  FileText,
  Mic,
  Brain,
  Video,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, AnalysisResult, AnalyticsSummary } from "./types";
import { SvgCharts } from "./components/SvgCharts";
import { VoicePanel } from "./components/VoicePanel";
import { BodyPanel } from "./components/BodyPanel";
import { FusionPanel } from "./components/FusionPanel";
import { EmojiInsights } from "./components/EmojiInsights";

export const SUPPORTED_LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Spanish", label: "Spanish (Español)" },
  { code: "French", label: "French (Français)" },
  { code: "German", label: "German (Deutsch)" },
  { code: "Italian", label: "Italian (Italiano)" },
  { code: "Portuguese", label: "Portuguese (Português)" },
  { code: "Hindi", label: "Hindi (हिन्दी)" },
  { code: "Japanese", label: "Japanese (日本語)" },
  { code: "Chinese", label: "Chinese (中文 - 简体)" },
  { code: "Korean", label: "Korean (한국어)" },
  { code: "Arabic", label: "Arabic (العربية)" },
  { code: "Russian", label: "Russian (Русский)" },
  { code: "Dutch", label: "Dutch (Nederlands)" },
  { code: "Turkish", label: "Turkish (Türkçe)" },
  { code: "Vietnamese", label: "Vietnamese (Tiếng Việt)" },
  { code: "Bengali", label: "Bengali (বাংলা)" },
];

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(true);

  // View State: 'landing' | 'app'
  const [currentScreen, setCurrentScreen] = useState<"landing" | "app">(
    "landing",
  );

  // App Tabs: 'dashboard' | 'camera' | 'history' | 'analytics' | 'profile' | 'compare' | 'batch'
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core App Data States
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [captionLanguage, setCaptionLanguage] = useState<string>("English");
  const [translatingLanguage, setTranslatingLanguage] =
    useState<boolean>(false);

  // Single Analysis States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(
    null,
  );
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Batch Analysis States
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchProgress, setBatchProgress] = useState<
    { name: string; status: "pending" | "processing" | "done" | "failed" }[]
  >([]);
  const [batchResults, setBatchResults] = useState<AnalysisResult[]>([]);

  // Image Compare States
  const [compareId1, setCompareId1] = useState<string>("");
  const [compareId2, setCompareId2] = useState<string>("");

  // Live Camera States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // History Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");
  const [vibeFilter, setVibeFilter] = useState("");

  // Load User and App Data
  useEffect(() => {
    fetchUser();
    fetchHistory();
    fetchAnalytics();
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsDark(data.user.theme === "dark");
      }
    } catch (e) {
      console.log("No active user session.");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        if (data.history.length > 0 && !activeAnalysis) {
          setActiveAnalysis(data.history[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const url = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsDark(data.user.theme === "dark");
        setShowAuthModal(false);
        setCurrentScreen("app");
        fetchHistory();
        fetchAnalytics();
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCurrentScreen("landing");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleUpdateTheme = async (newTheme: "dark" | "light") => {
    setIsDark(newTheme === "dark");
    if (user) {
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateProfile = async (name: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        alert("Profile updated successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Image Upload Analysis Handler
  const analyzeFile = async (file: File) => {
    setLoading(true);
    try {
      // Convert image to base64 using a Promise-based approach
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/analyze/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          language: captionLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAnalysis(data.result);
        fetchHistory();
        fetchAnalytics();
      } else {
        const data = await res.json();
        alert(data.error || "Image analysis failed.");
      }
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Error reading file.");
    } finally {
      setLoading(false);
    }
  };

  const translateCaptionsToLanguage = async (targetLang: string) => {
    if (!activeAnalysis || !activeAnalysis.captions) return;
    setTranslatingLanguage(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captions: activeAnalysis.captions,
          language: targetLang,
        }),
      });
      const data = await res.json();
      if (res.ok && data.translated?.captions) {
        setActiveAnalysis((prev) =>
          prev
            ? {
                ...prev,
                captions: data.translated.captions,
              }
            : null,
        );
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingLanguage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        analyzeFile(file);
      } else {
        alert("Please drop a valid image file (JPG, PNG, WEBP).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      analyzeFile(file);
    }
  };

  // Batch Image Drop & Analyze
  const handleBatchDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        if (e.dataTransfer.files[i].type.startsWith("image/")) {
          files.push(e.dataTransfer.files[i]);
        }
      }
      if (files.length > 0) {
        setBatchFiles((prev) => [...prev, ...files]);
        setBatchProgress((prev) => [
          ...prev,
          ...files.map((f) => ({ name: f.name, status: "pending" as const })),
        ]);
      }
    }
  };

  const processBatch = async () => {
    if (batchFiles.length === 0) return;
    setLoading(true);
    const results: AnalysisResult[] = [];

    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      setBatchProgress((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "processing" } : item,
        ),
      );

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const res = await fetch("/api/analyze/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            language: captionLanguage,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          results.push(data.result);
          setBatchProgress((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "done" } : item,
            ),
          );
        } else {
          setBatchProgress((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "failed" } : item,
            ),
          );
        }
      } catch (err) {
        setBatchProgress((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "failed" } : item,
          ),
        );
      }
    }

    setBatchResults(results);
    setLoading(false);
    fetchHistory();
    fetchAnalytics();
    alert(`Batch Complete! Successfully analyzed ${results.length} images.`);
  };

  // Native Camera Handlers
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert(
        "Could not access your camera. Please grant browser frame permissions.",
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Frame = canvas.toDataURL("image/jpeg");
    setPreviewUrl(base64Frame);

    // Trigger analysis
    setLoading(true);
    try {
      const res = await fetch("/api/analyze/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Frame,
          language: captionLanguage,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setActiveAnalysis(data.result);
        fetchHistory();
        fetchAnalytics();
        setActiveTab("dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Snapshot analysis failed.");
    } finally {
      setLoading(false);
      stopCamera();
    }
  };

  const triggerCameraCountdown = () => {
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev === 1) {
          clearInterval(interval);
          captureCameraFrame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clipboard Copier helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Delete Analysis Handlers
  const handleDeleteAnalysis = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this analysis result?"))
      return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updatedHistory = history.filter((h) => h.id !== id);
        setHistory(updatedHistory);
        if (activeAnalysis?.id === id) {
          setActiveAnalysis(updatedHistory[0] || null);
        }
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter history results
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.sceneType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.overallVibe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryEmotion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.objectsDetected?.some((o) =>
        o.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesEmotion =
      !emotionFilter || item.primaryEmotion === emotionFilter;
    const matchesVibe = !vibeFilter || item.overallVibe === vibeFilter;

    return matchesSearch && matchesEmotion && matchesVibe;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#050505] text-slate-200" : "bg-[#f8f9fc] text-[#1e272e]"}`}
      id="vibelens-root"
    >
      {/* 1. TOP HEADER NAVIGATION */}
      <header
        className={`sticky top-0 z-40 px-6 py-4 border-b transition-colors ${isDark ? "bg-[#050505]/80 border-white/10 backdrop-blur-md" : "bg-white/80 border-gray-100 backdrop-blur-md"}`}
        id="vibelens-header"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentScreen("landing")}
          >
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20"
              id="vibelens-logo-box"
            >
              <div className="w-5 h-5 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                VibeLens
              </span>
              <span className="text-[10px] block font-mono tracking-widest opacity-60 uppercase text-purple-400">
                LIVE DASHBOARD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <button
              onClick={() => handleUpdateTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-lg transition ${isDark ? "hover:bg-white/5 text-yellow-400" : "hover:bg-gray-100 text-violet-600"}`}
              title="Toggle Theme"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {currentScreen === "app" ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono opacity-80 hidden md:inline">
                  {user ? `Hi, ${user.name}` : "Demo Session"}
                </span>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                  id="logout-btn"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (user) {
                    setCurrentScreen("app");
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-xs hover:opacity-90 transition shadow-md shadow-purple-500/20"
                id="enter-app-header-btn"
              >
                {user ? "Dashboard" : "Launch Console"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. LANDING SCREEN */}
      {currentScreen === "landing" && (
        <main
          className="max-w-7xl mx-auto px-6 py-12 md:py-24"
          id="vibelens-landing"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6" id="landing-hero-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold"
                id="new-feature-badge"
              >
                <Sparkles size={13} />
                <span>Powered by Gemini Multimodal Vision AI</span>
              </div>

              <h1
                className="text-4xl md:text-6xl font-extrabold tracking-tight font-display leading-[1.1]"
                id="landing-headline"
              >
                Decode the{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                  Emotional Pulse
                </span>{" "}
                & Vibe of Any Visual Scene.
              </h1>

              <p
                className={`text-base md:text-lg max-w-xl font-light leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}
                id="landing-subtext"
              >
                VibeLens analyzes uploaded images and live camera streams to
                detect deep emotions, extract scene contexts, decode color
                psychology, and immediately curate captions, trending tags, and
                songs.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    if (user) {
                      setCurrentScreen("app");
                    } else {
                      setShowAuthModal(true);
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-semibold text-sm hover:opacity-95 transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  id="landing-cta-primary"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setCurrentScreen("app");
                    setActiveTab("analytics");
                  }}
                  className={`px-5 py-3.5 rounded-xl border font-semibold text-sm transition flex items-center gap-2 ${isDark ? "border-white/10 hover:bg-white/5 bg-black/40 text-slate-200" : "border-gray-200 hover:bg-gray-50 bg-white"}`}
                  id="landing-cta-secondary"
                >
                  <BarChart3 size={15} />
                  <span>View Global Analytics</span>
                </button>
              </div>

              {/* Metric stats */}
              <div
                className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-200 dark:border-white/10"
                id="landing-metrics-row"
              >
                <div>
                  <span className="block text-2xl md:text-3xl font-extrabold font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    99.4%
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-mono opacity-60">
                    Accuracy Ratio
                  </span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-extrabold font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    &lt; 1s
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-mono opacity-60">
                    Response Speed
                  </span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-extrabold font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    25+
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-mono opacity-60">
                    Mood Parameters
                  </span>
                </div>
              </div>
            </div>

            {/* Graphic mockup on landing page right */}
            <div className="lg:col-span-5 relative" id="landing-hero-right">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60"></div>

              <div
                className={`p-6 rounded-3xl relative border shadow-2xl ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"}`}
                id="landing-mockup-card"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">
                    Visual Telemetry
                  </span>
                </div>

                <div
                  className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-4 group"
                  id="mockup-img-container"
                >
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"
                    alt="Sample analysis"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white rounded-lg px-2.5 py-1 text-[10px] font-mono border border-white/10">
                    Faces detected [2]
                  </div>
                  <div className="absolute bottom-3 right-3 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide shadow">
                    Happy Vibe: 94%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">Scene Classification</span>
                    <span className="font-semibold text-emerald-500">
                      Outdoor Café Sunset (95%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">Color Psychology</span>
                    <span className="font-semibold text-orange-400">
                      Warm Golden Amber
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-wide opacity-50 block mb-1">
                      Generated Caption
                    </span>
                    <p className="text-xs italic opacity-90">
                      "Chasing warm lights and sunset memories in beautiful
                      companionship. 🌅✨"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing section */}
          <section
            className="py-16 mt-16 border-t border-gray-200 dark:border-white/10"
            id="pricing-section"
          >
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold font-display">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xs opacity-60 mt-1">
                Whether you are an individual creator or a full-scale agency, we
                scale with you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div
                className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-200"}`}
              >
                <h4 className="text-sm font-semibold tracking-wide uppercase opacity-60">
                  Basic Spark
                </h4>
                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display">$0</span>
                  <span className="text-xs opacity-50">/ forever</span>
                </div>
                <p className="text-xs opacity-75 mb-6">
                  Explore visual moods, mockups, and run limited manual image
                  uploads.
                </p>
                <button
                  onClick={() => setCurrentScreen("app")}
                  className="w-full py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-xs font-bold transition"
                >
                  Start Instantly
                </button>
              </div>
              <div
                className={`p-6 rounded-2xl border relative ${isDark ? "bg-white/5 border-purple-500/50 glow-purple backdrop-blur-md" : "bg-white border-violet-200 shadow-md"}`}
              >
                <div className="absolute top-3 right-3 bg-gradient-to-tr from-purple-600 to-pink-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h4 className="text-sm font-semibold tracking-wide uppercase opacity-60">
                  Creator Pro
                </h4>
                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display">$19</span>
                  <span className="text-xs opacity-50">/ month</span>
                </div>
                <p className="text-xs opacity-75 mb-6">
                  Unlimited Gemini-powered multimodal scans, live webcam, batch
                  processing, and exports.
                </p>
                <button
                  onClick={() => setCurrentScreen("app")}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
                >
                  Upgrade Now
                </button>
              </div>
              <div
                className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-200"}`}
              >
                <h4 className="text-sm font-semibold tracking-wide uppercase opacity-60">
                  Enterprise Flow
                </h4>
                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display">$89</span>
                  <span className="text-xs opacity-50">/ month</span>
                </div>
                <p className="text-xs opacity-75 mb-6">
                  Full API access keys, dedicated customer support, customized
                  brand sentiment analytics.
                </p>
                <button
                  onClick={() => alert("Contact team: support@vibelens.ai")}
                  className="w-full py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-xs font-bold transition"
                >
                  Contact Team
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="text-center py-10 border-t border-gray-200 dark:border-white/10 text-xs opacity-50 space-y-2 mt-16"
            id="vibelens-footer"
          >
            <p>
              © 2026 VibeLens Inc. Created with premium full-stack architecture.
            </p>
            <p>Admin session active. Fully responsive visual portal.</p>
          </footer>
        </main>
      )}

      {/* 3. WORKING APP CONSOLE SCREEN */}
      {currentScreen === "app" && (
        <div className="max-w-7xl mx-auto px-6 py-8" id="vibelens-console">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Controls */}
            <aside className="lg:col-span-3 space-y-4" id="console-sidebar">
              {/* Navigation List */}
              <div
                className={`p-4 rounded-2xl border space-y-1.5 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                id="sidebar-nav-panel"
              >
                <span className="text-[10px] font-mono tracking-widest opacity-40 uppercase block mb-3 px-2">
                  Console Tabs
                </span>

                {[
                  {
                    id: "dashboard",
                    label: "Analysis Console",
                    icon: <Upload size={16} />,
                  },
                  {
                    id: "batch",
                    label: "Batch Processing",
                    icon: <Layers size={16} />,
                  },
                  {
                    id: "camera",
                    label: "Live Webcam API",
                    icon: <Camera size={16} />,
                  },
                  {
                    id: "compare",
                    label: "Vibe Comparer",
                    icon: <Sliders size={16} />,
                  },
                  {
                    id: "voice",
                    label: "Voice Sentiment AI",
                    icon: <Mic size={16} />,
                  },
                  {
                    id: "body",
                    label: "Body Language AI",
                    icon: <Video size={16} />,
                  },
                  {
                    id: "fusion",
                    label: "Fusion EI Engine",
                    icon: <Brain size={16} />,
                  },
                  {
                    id: "history",
                    label: "History Archive",
                    icon: <History size={16} />,
                  },
                  {
                    id: "analytics",
                    label: "Interactive Stats",
                    icon: <BarChart3 size={16} />,
                  },
                  {
                    id: "profile",
                    label: "Profile Preferences",
                    icon: <UserIcon size={16} />,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "camera") stopCamera();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/15"
                        : isDark
                          ? "hover:bg-white/5 text-slate-400 hover:text-white"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                    id={`sidebar-tab-btn-${tab.id}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Application Area (Tab Contents) */}
            <main className="lg:col-span-9 space-y-6" id="console-tab-viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  id="tab-motion-wrapper"
                >
                  {/* TAB 1: SINGLE ANALYSIS CONSOLE */}
                  {activeTab === "dashboard" && (
                    <div
                      className="grid grid-cols-1 xl:grid-cols-12 gap-6"
                      id="dashboard-tab-content"
                    >
                      {/* Analysis Left (Upload or Preview) */}
                      <div className="xl:col-span-5 space-y-6">
                        <div
                          className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                          id="upload-panel"
                        >
                          <h2 className="text-lg font-bold font-display tracking-tight mb-4">
                            Analyze Visual Vibe
                          </h2>

                          {/* File input drag n drop box */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] ${
                              isDark
                                ? "border-white/10 hover:border-purple-500 bg-black/40"
                                : "border-gray-200 hover:border-violet-500 bg-gray-50"
                            }`}
                            onClick={() =>
                              document.getElementById("file-picker")?.click()
                            }
                            id="drag-drop-zone"
                          >
                            <input
                              type="file"
                              id="file-picker"
                              className="hidden"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleFileChange}
                            />
                            <div
                              className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3"
                              id="upload-icon-box"
                            >
                              <Upload size={22} />
                            </div>
                            <span className="text-xs font-semibold">
                              Drag & Drop Image here
                            </span>
                            <span className="text-[10px] opacity-50 mt-1">
                              PNG, JPG, WEBP formats supported
                            </span>
                            <span className="text-[10px] text-purple-400 font-semibold mt-3 bg-purple-500/5 px-2.5 py-1 rounded-full border border-purple-500/10">
                              Or Browse Local Files
                            </span>
                          </div>

                          {/* Language selector for captions */}
                          <div
                            className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                            id="lang-selector-row"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="opacity-60 font-medium">
                              Caption Target Language:
                            </span>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <select
                                value={captionLanguage}
                                onChange={(e) => {
                                  const newLang = e.target.value;
                                  setCaptionLanguage(newLang);
                                  if (activeAnalysis) {
                                    translateCaptionsToLanguage(newLang);
                                  }
                                }}
                                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-semibold border ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                                id="lang-select-field"
                              >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.label}
                                  </option>
                                ))}
                              </select>

                              {activeAnalysis && (
                                <button
                                  onClick={() =>
                                    translateCaptionsToLanguage(captionLanguage)
                                  }
                                  disabled={translatingLanguage}
                                  className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-[11px] rounded-lg border border-purple-500/20 transition flex items-center gap-1.5 shrink-0"
                                  title="Translate current analysis captions to selected language"
                                  id="translate-captions-btn"
                                >
                                  <Globe
                                    size={13}
                                    className={
                                      translatingLanguage ? "animate-spin" : ""
                                    }
                                  />
                                  <span>
                                    {translatingLanguage
                                      ? "Translating..."
                                      : "Translate"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Preview Box */}
                        {previewUrl && (
                          <div
                            className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                            id="image-preview-panel"
                          >
                            <span className="text-[10px] font-mono tracking-wider opacity-50 block mb-2 uppercase">
                              Uploaded Preview
                            </span>
                            <div
                              className="aspect-video rounded-xl overflow-hidden bg-black border border-gray-100 dark:border-white/10"
                              id="preview-image-box"
                            >
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Analysis Right (Results telemetry) */}
                      <div
                        className="xl:col-span-7"
                        id="analysis-details-parent"
                      >
                        {loading ? (
                          <div
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4 h-full"
                            id="analysis-loader"
                          >
                            <div
                              className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-600 animate-spin"
                              id="spinner-circle"
                            ></div>
                            <div>
                              <p className="text-sm font-semibold tracking-wide animate-pulse">
                                Running Multimodal Psychology Engine...
                              </p>
                              <p className="text-xs opacity-50 mt-1">
                                Generating captions, color charts, vibes & song
                                links
                              </p>
                            </div>
                          </div>
                        ) : activeAnalysis ? (
                          <div
                            className={`p-6 rounded-3xl border space-y-6 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                            id="active-analysis-report"
                          >
                            {/* Analysis Header */}
                            <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/10 pb-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                                    VIBELENS SCALED DATA
                                  </span>
                                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold flex items-center gap-1">
                                    <Globe size={11} />
                                    {captionLanguage}
                                  </span>
                                  <span className="text-[10px] opacity-50">
                                    {new Date(
                                      activeAnalysis.timestamp,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <h3 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mt-1">
                                  Mood Analysis Report
                                </h3>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.print()}
                                  className={`p-2 rounded-xl border transition ${isDark ? "border-white/10 hover:bg-white/5 text-slate-200" : "border-gray-200 hover:bg-gray-50"}`}
                                  title="Export Report (PDF / Print)"
                                  id="print-report-btn"
                                >
                                  <FileText size={15} />
                                </button>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.stringify(activeAnalysis, null, 2),
                                      "json-report",
                                    )
                                  }
                                  className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${isDark ? "border-white/10 hover:bg-white/5 text-slate-200" : "border-gray-200 hover:bg-gray-50"}`}
                                  title="Copy Raw Telemetry"
                                  id="copy-json-btn"
                                >
                                  {copiedTextId === "json-report" ? (
                                    <Check
                                      size={13}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <Download size={13} />
                                  )}
                                  <span className="hidden sm:inline">JSON</span>
                                </button>
                              </div>
                            </div>

                            {/* Core 4 bento row */}
                            <div
                              className="grid grid-cols-2 gap-4"
                              id="bento-metrics-row"
                            >
                              {/* 1. Emotion */}
                              <div
                                className={`p-4 rounded-2xl border ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="metric-emotion-card"
                              >
                                <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                                  Primary Emotion
                                </span>
                                <span className="text-xl font-bold block mt-1 text-emerald-500">
                                  {activeAnalysis.primaryEmotion}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] opacity-60 mt-1">
                                  <span>Confidence:</span>
                                  <span className="font-mono font-bold">
                                    {(
                                      activeAnalysis.confidenceScore * 100
                                    ).toFixed(0)}
                                    %
                                  </span>
                                </div>
                              </div>

                              {/* 2. Vibe */}
                              <div
                                className={`p-4 rounded-2xl border ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="metric-vibe-card"
                              >
                                <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                                  Overall Vibe
                                </span>
                                <span className="text-xl font-bold block mt-1 text-pink-500">
                                  {activeAnalysis.overallVibe}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] opacity-60 mt-1">
                                  <span>Confidence:</span>
                                  <span className="font-mono font-bold">
                                    {(
                                      (activeAnalysis.vibeConfidence || 0.9) *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </span>
                                </div>
                              </div>

                              {/* 3. Scene context */}
                              <div
                                className={`p-4 rounded-2xl border ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="metric-scene-card"
                              >
                                <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                                  Scene Context
                                </span>
                                <span className="text-sm font-bold block mt-1 truncate">
                                  {activeAnalysis.sceneType}
                                </span>
                                <span className="text-[10px] font-mono opacity-50 mt-1 block">
                                  Objects:{" "}
                                  {activeAnalysis.objectsDetected
                                    ?.slice(0, 3)
                                    .join(", ") || "none"}
                                </span>
                              </div>

                              {/* 4. Color psychology */}
                              <div
                                className={`p-4 rounded-2xl border ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="metric-color-card"
                              >
                                <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                                  Color Psychology
                                </span>
                                <span className="text-sm font-bold block mt-1 text-amber-500">
                                  {activeAnalysis.colorTone}
                                </span>
                                <div
                                  className="flex gap-1.5 mt-1.5"
                                  id="color-dots-tray"
                                >
                                  {activeAnalysis.colors?.map((col, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className="w-4 h-4 rounded-full border border-white/20 block"
                                      style={{ backgroundColor: col }}
                                      title={col}
                                    ></span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Emoji Response Insights */}
                            <EmojiInsights
                              isDark={isDark}
                              type="face"
                              data={activeAnalysis}
                            />

                            {/* Color Psychology detailed description */}
                            {activeAnalysis.colorInterpretation && (
                              <div
                                className={`p-4 rounded-2xl text-xs space-y-1.5 border leading-relaxed ${isDark ? "bg-black/30 border-white/10" : "bg-gray-100/50 border-gray-200"}`}
                                id="color-interpretation-panel"
                              >
                                <span className="font-semibold block text-amber-500">
                                  Color Atmospheric Interpretation
                                </span>
                                <p className="opacity-80 font-medium">
                                  {activeAnalysis.colorInterpretation}
                                </p>
                              </div>
                            )}

                            {/* Emotion Probabilities percentages */}
                            {activeAnalysis.emotions && (
                              <div
                                className="space-y-2.5"
                                id="emotion-probabilities-panel"
                              >
                                <span className="text-[11px] font-mono uppercase tracking-wider opacity-50 block">
                                  Detected Emotion Percentages
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                  {Object.keys(activeAnalysis.emotions).map(
                                    (emoKey, emoIdx) => {
                                      const score =
                                        activeAnalysis.emotions[emoKey];
                                      return (
                                        <div
                                          key={emoIdx}
                                          className="flex items-center gap-2 text-xs"
                                          id={`emo-progress-${emoKey}`}
                                        >
                                          <span className="w-16 font-semibold opacity-70 truncate">
                                            {emoKey}
                                          </span>
                                          <div className="flex-1 bg-gray-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div
                                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                                              style={{
                                                width: `${score * 100}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="w-8 text-right font-mono opacity-60">
                                            {(score * 100).toFixed(0)}%
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Captions Generator display */}
                            {activeAnalysis.captions && (
                              <div
                                className="space-y-3"
                                id="captions-generator-panel"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-mono uppercase tracking-wider opacity-50">
                                    AI Multiverse Caption Matrix (
                                    {captionLanguage})
                                  </span>
                                  <span className="text-[10px] font-bold text-purple-400">
                                    Click to Copy
                                  </span>
                                </div>
                                <div className="space-y-2.5" id="captions-list">
                                  {activeAnalysis.captions.map(
                                    (cap, capIdx) => (
                                      <div
                                        key={capIdx}
                                        onClick={() =>
                                          copyToClipboard(
                                            cap.text,
                                            `cap-${capIdx}`,
                                          )
                                        }
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex justify-between items-center group relative ${
                                          isDark
                                            ? "bg-black/30 hover:bg-white/5 border-white/10"
                                            : "bg-gray-50/50 hover:bg-gray-100 border-gray-100"
                                        }`}
                                        id={`caption-card-${capIdx}`}
                                      >
                                        <div className="pr-4 flex-1">
                                          <span className="font-mono text-[9px] uppercase tracking-widest text-purple-400 font-bold block mb-1">
                                            {cap.style} Style
                                          </span>
                                          <p className="opacity-90 italic">
                                            "{cap.text}"
                                          </p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-purple-400 transition">
                                          {copiedTextId === `cap-${capIdx}` ? (
                                            <Check
                                              size={14}
                                              className="text-emerald-500"
                                            />
                                          ) : (
                                            <Copy size={13} />
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Hashtags section */}
                            {activeAnalysis.hashtags && (
                              <div className="space-y-2" id="hashtags-panel">
                                <span className="text-[11px] font-mono uppercase tracking-wider opacity-50 block">
                                  AI Context Hashtags
                                </span>
                                <div
                                  className="flex flex-wrap gap-1.5"
                                  id="hashtags-tray"
                                >
                                  {activeAnalysis.hashtags.map(
                                    (tag, tagIdx) => (
                                      <span
                                        key={tagIdx}
                                        onClick={() =>
                                          copyToClipboard(
                                            `#${tag}`,
                                            `tag-${tagIdx}`,
                                          )
                                        }
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium cursor-pointer transition ${
                                          copiedTextId === `tag-${tagIdx}`
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                            : isDark
                                              ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                                              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                                        }`}
                                        id={`hashtag-tag-${tagIdx}`}
                                      >
                                        #{tag}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Music Recommendations */}
                            {activeAnalysis.musicRecommendations && (
                              <div
                                className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/10"
                                id="music-recommendations-panel"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-mono uppercase tracking-wider opacity-50 flex items-center gap-1">
                                    <Music
                                      size={12}
                                      className="text-pink-500"
                                    />
                                    <span>
                                      Vibe-Matched Spotify Playlist Recommend
                                    </span>
                                  </span>
                                  <span className="text-[10px] opacity-40 font-mono">
                                    Dynamic Match
                                  </span>
                                </div>
                                <div
                                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                  id="songs-grid"
                                >
                                  {activeAnalysis.musicRecommendations.map(
                                    (song, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                          isDark
                                            ? "bg-black/30 border-white/10"
                                            : "bg-gray-50/50 border-gray-100"
                                        }`}
                                        id={`song-card-${sIdx}`}
                                      >
                                        <div className="space-y-0.5">
                                          <span className="font-bold block opacity-95 text-pink-500">
                                            {song.title}
                                          </span>
                                          <span className="opacity-60 block text-[10px] font-medium">
                                            {song.artist} • {song.genre}
                                          </span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/10 text-[9px] uppercase font-bold tracking-wider font-mono">
                                          {song.vibe}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4 h-full"
                            id="empty-analysis-screen"
                          >
                            <ImageIcon
                              size={40}
                              className="text-purple-500 animate-pulse"
                            />
                            <div>
                              <p className="text-sm font-semibold tracking-wide">
                                Ready for Image Analysis
                              </p>
                              <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed opacity-60">
                                Drop or upload a photo to immediately detect
                                visual feelings, scene details, color
                                psychology, captions, and songs.
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                setLoading(true);
                                try {
                                  const demoCanvas =
                                    document.createElement("canvas");
                                  demoCanvas.width = 400;
                                  demoCanvas.height = 300;
                                  const ctx = demoCanvas.getContext("2d");
                                  if (ctx) {
                                    const grad = ctx.createLinearGradient(
                                      0,
                                      0,
                                      400,
                                      300,
                                    );
                                    grad.addColorStop(0, "#8b5cf6");
                                    grad.addColorStop(1, "#ec4899");
                                    ctx.fillStyle = grad;
                                    ctx.fillRect(0, 0, 400, 300);
                                    ctx.fillStyle = "#ffffff";
                                    ctx.font = "bold 20px sans-serif";
                                    ctx.fillText(
                                      "VibeLens Sample Canvas",
                                      80,
                                      160,
                                    );
                                  }
                                  const base64Data =
                                    demoCanvas.toDataURL("image/png");
                                  setPreviewUrl(base64Data);
                                  const res = await fetch(
                                    "/api/analyze/image",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        imageBase64: base64Data,
                                        language: captionLanguage,
                                      }),
                                    },
                                  );
                                  if (res.ok) {
                                    const data = await res.json();
                                    setActiveAnalysis(data.result);
                                    fetchHistory();
                                    fetchAnalytics();
                                  }
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-4 py-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition shadow-md shadow-purple-500/15 flex items-center gap-1.5 cursor-pointer mt-2"
                              id="run-demo-btn"
                            >
                              <Sparkles size={14} />
                              <span>Run Quick Sample Analysis</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BATCH IMAGE PROCESSING */}
                  {activeTab === "batch" && (
                    <div
                      className={`p-6 rounded-3xl border space-y-6 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                      id="batch-tab-content"
                    >
                      <div>
                        <h2 className="text-xl font-bold font-display tracking-tight">
                          Batch Image Processing
                        </h2>
                        <p className="text-xs opacity-60 mt-0.5">
                          Analyze multiple images in sequence to bulk-generate
                          visual feelings and metrics.
                        </p>
                      </div>

                      {/* Batch Drag Drop Box */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleBatchDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[200px] ${
                          isDark
                            ? "border-white/10 hover:border-purple-500 bg-black/40"
                            : "border-gray-200 hover:border-violet-500 bg-gray-50"
                        }`}
                        onClick={() =>
                          document.getElementById("batch-picker")?.click()
                        }
                        id="batch-drag-drop"
                      >
                        <input
                          type="file"
                          id="batch-picker"
                          className="hidden"
                          multiple
                          accept="image/png, image/jpeg, image/webp"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files: File[] = [];
                              for (let i = 0; i < e.target.files.length; i++) {
                                files.push(e.target.files[i]);
                              }
                              setBatchFiles((prev) => [...prev, ...files]);
                              setBatchProgress((prev) => [
                                ...prev,
                                ...files.map((f) => ({
                                  name: f.name,
                                  status: "pending" as const,
                                })),
                              ]);
                            }
                          }}
                        />
                        <Layers
                          size={30}
                          className="text-purple-500 mb-3 animate-float"
                        />
                        <span className="text-xs font-semibold">
                          Drag & Drop Multiple Images here
                        </span>
                        <span className="text-[10px] opacity-50 mt-1">
                          PNG, JPG, WEBP formats supported
                        </span>
                        <span className="text-[10px] text-purple-400 font-semibold mt-3 bg-purple-500/5 px-2.5 py-1 rounded-full border border-purple-500/10">
                          Or Select Files
                        </span>
                      </div>

                      {/* File List Grid & Start process button */}
                      {batchFiles.length > 0 && (
                        <div className="space-y-4" id="batch-files-panel">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold">
                              Selected Files ({batchFiles.length})
                            </span>
                            <button
                              onClick={() => {
                                setBatchFiles([]);
                                setBatchProgress([]);
                                setBatchResults([]);
                              }}
                              className="text-xs font-semibold text-red-500 hover:underline"
                              id="clear-batch-btn"
                            >
                              Clear All
                            </button>
                          </div>

                          <div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            id="batch-progress-list"
                          >
                            {batchProgress.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                  isDark
                                    ? "bg-black/30 border-white/10"
                                    : "bg-gray-50/50 border-gray-100"
                                }`}
                                id={`batch-item-${idx}`}
                              >
                                <span className="truncate font-medium flex-1 pr-4">
                                  {item.name}
                                </span>
                                <span
                                  className={`font-mono text-[10px] uppercase font-bold ${
                                    item.status === "done"
                                      ? "text-emerald-500"
                                      : item.status === "processing"
                                        ? "text-purple-400 animate-pulse"
                                        : item.status === "failed"
                                          ? "text-red-500"
                                          : "opacity-50"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={processBatch}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs hover:opacity-90 disabled:opacity-50 transition shadow-md shadow-purple-500/20"
                            id="run-batch-btn"
                          >
                            {loading
                              ? "Processing Sequences..."
                              : "Start Batch Analysis Sequence"}
                          </button>
                        </div>
                      )}

                      {/* Batch results list */}
                      {batchResults.length > 0 && (
                        <div
                          className="space-y-4 border-t border-gray-100 dark:border-white/10 pt-6"
                          id="batch-results-panel"
                        >
                          <span className="text-sm font-bold font-display block">
                            Batch Results ({batchResults.length})
                          </span>
                          <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            id="batch-results-cards"
                          >
                            {batchResults.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-xl border space-y-2 cursor-pointer hover:border-purple-500/50 transition ${
                                  isDark
                                    ? "bg-black/30 border-white/10"
                                    : "bg-white border-gray-200"
                                }`}
                                onClick={() => {
                                  setActiveAnalysis(item);
                                  setActiveTab("dashboard");
                                }}
                                id={`batch-result-card-${idx}`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                                    Result #{idx + 1}
                                  </span>
                                  <span className="text-[10px] opacity-40">
                                    {new Date(
                                      item.timestamp,
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold block">
                                    {item.sceneType}
                                  </span>
                                  <span className="text-xs font-bold text-pink-500">
                                    {item.overallVibe}
                                  </span>
                                </div>
                                <p className="text-xs italic opacity-80 truncate">
                                  "{item.captions?.[0]?.text}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LIVE CAMERA Snapshot */}
                  {activeTab === "camera" && (
                    <div
                      className={`p-6 rounded-3xl border space-y-6 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                      id="camera-tab-content"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold font-display tracking-tight">
                            Live Camera Analysis API
                          </h2>
                          <p className="text-xs opacity-60 mt-0.5">
                            Open your camera, trigger a snapshot, and let
                            VibeLens parse emotions & vibe in real-time.
                          </p>
                        </div>
                        {cameraActive ? (
                          <button
                            onClick={stopCamera}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition"
                            id="stop-camera-btn"
                          >
                            Disable Camera
                          </button>
                        ) : (
                          <button
                            onClick={startCamera}
                            className="px-3.5 py-1.5 bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition"
                            id="start-camera-btn"
                          >
                            Activate Live Camera
                          </button>
                        )}
                      </div>

                      {/* Webcam viewport box */}
                      <div
                        className="relative aspect-video max-w-2xl mx-auto rounded-3xl overflow-hidden bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center"
                        id="camera-view-container"
                      >
                        {/* Hidden canvas helper for capturing snapshot */}
                        <canvas ref={canvasRef} className="hidden"></canvas>

                        {cameraActive ? (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover scale-x-[-1]" // mirrored
                              id="live-camera-video"
                            ></video>

                            {/* Bounding box guide overlay */}
                            <div
                              className="absolute inset-0 border-2 border-dashed border-purple-500/25 pointer-events-none flex items-center justify-center"
                              id="camera-overlay-box"
                            >
                              <div className="w-48 h-48 border-2 border-purple-500 rounded-2xl opacity-40 flex items-center justify-center">
                                <span className="text-[9px] font-mono uppercase text-purple-400 bg-black/40 px-2 py-0.5 rounded">
                                  Align Face Here
                                </span>
                              </div>
                            </div>

                            {/* Take Photo floating button */}
                            <div
                              className="absolute bottom-6 left-0 right-0 flex justify-center"
                              id="capture-actions"
                            >
                              <button
                                onClick={triggerCameraCountdown}
                                disabled={loading || cameraCountdown !== null}
                                className="px-5 py-3 bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-lg transition flex items-center gap-2"
                                id="capture-snapshot-btn"
                              >
                                {cameraCountdown !== null ? (
                                  <span>Capturing in {cameraCountdown}...</span>
                                ) : (
                                  <>
                                    <Camera size={14} />
                                    <span>Capture Vibe Snapshot</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className="text-center p-8 space-y-3 opacity-60"
                            id="camera-inactive-view"
                          >
                            <Camera
                              size={40}
                              className="mx-auto text-gray-500 animate-pulse"
                            />
                            <div>
                              <p className="text-sm font-semibold tracking-wide">
                                Camera Feed Inactive
                              </p>
                              <p className="text-xs max-w-xs mx-auto mt-1">
                                Activate your webcam framework to begin. Frames
                                are processed entirely server-side safely.
                              </p>
                            </div>
                            <button
                              onClick={startCamera}
                              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs rounded-xl border border-purple-500/20 transition mt-2"
                              id="activate-camera-btn-inner"
                            >
                              Connect Live Stream
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs space-y-1 border ${isDark ? "bg-black/40 border-white/10 text-slate-400" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                        id="camera-info-banner"
                      >
                        <span className="font-bold text-purple-400 flex items-center gap-1">
                          <HelpCircle size={13} />
                          <span>Local offline-simulation mode supported</span>
                        </span>
                        <p>
                          If you don't grant webcam permissions, you can always
                          test single uploads and batch uploads seamlessly.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: VIBE COMPARER side by side */}
                  {activeTab === "compare" && (
                    <div
                      className={`p-6 rounded-3xl border space-y-6 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                      id="compare-tab-content"
                    >
                      <div>
                        <h2 className="text-xl font-bold font-display tracking-tight">
                          Compare Image Vibes
                        </h2>
                        <p className="text-xs opacity-60 mt-0.5">
                          Select any two previous analyses to compare emotions,
                          scene types, and vibes side-by-side.
                        </p>
                      </div>

                      {/* Dropdown selectors */}
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        id="compare-selectors-grid"
                      >
                        {/* Selector 1 */}
                        <div className="space-y-1.5" id="compare-col-1-select">
                          <label className="text-xs font-semibold opacity-75">
                            Select Image 1:
                          </label>
                          <select
                            value={compareId1}
                            onChange={(e) => setCompareId1(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                            id="compare-1-select"
                          >
                            <option value="">
                              -- Choose Analysis Result 1 --
                            </option>
                            {history.map((h, hIdx) => (
                              <option key={hIdx} value={h.id}>
                                [{h.primaryEmotion}] {h.sceneType} (
                                {new Date(h.timestamp).toLocaleDateString()})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Selector 2 */}
                        <div className="space-y-1.5" id="compare-col-2-select">
                          <label className="text-xs font-semibold opacity-75">
                            Select Image 2:
                          </label>
                          <select
                            value={compareId2}
                            onChange={(e) => setCompareId2(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                            id="compare-2-select"
                          >
                            <option value="">
                              -- Choose Analysis Result 2 --
                            </option>
                            {history.map((h, hIdx) => (
                              <option key={hIdx} value={h.id}>
                                [{h.primaryEmotion}] {h.sceneType} (
                                {new Date(h.timestamp).toLocaleDateString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Side by side comparison dashboard */}
                      {compareId1 && compareId2 ? (
                        (() => {
                          const item1 = history.find(
                            (h) => h.id === compareId1,
                          );
                          const item2 = history.find(
                            (h) => h.id === compareId2,
                          );

                          if (!item1 || !item2)
                            return (
                              <div className="text-xs text-red-500">
                                Could not locate chosen records.
                              </div>
                            );

                          return (
                            <div
                              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-white/10"
                              id="comparison-results-grid"
                            >
                              {/* Item 1 Report */}
                              <div
                                className={`p-4 rounded-2xl border space-y-4 ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="compare-result-left"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-purple-400 font-bold">
                                    IMAGE ALPHA
                                  </span>
                                  <span className="text-[10px] opacity-40">
                                    {new Date(
                                      item1.timestamp,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Primary Emotion:
                                    </span>
                                    <span className="font-bold text-emerald-500">
                                      {item1.primaryEmotion} (
                                      {(item1.confidenceScore * 100).toFixed(0)}
                                      %)
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Overall Vibe:
                                    </span>
                                    <span className="font-bold text-pink-500">
                                      {item1.overallVibe}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Scene Context:
                                    </span>
                                    <span className="font-semibold">
                                      {item1.sceneType}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Color Tone:
                                    </span>
                                    <span className="font-semibold text-amber-500">
                                      {item1.colorTone}
                                    </span>
                                  </div>
                                  <div className="pt-2 text-xs">
                                    <span className="text-[10px] font-mono uppercase opacity-50 block mb-1">
                                      Generated Caption
                                    </span>
                                    <p className="italic opacity-80">
                                      "{item1.captions?.[0]?.text}"
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Item 2 Report */}
                              <div
                                className={`p-4 rounded-2xl border space-y-4 ${isDark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                id="compare-result-right"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-pink-400 font-bold">
                                    IMAGE BETA
                                  </span>
                                  <span className="text-[10px] opacity-40">
                                    {new Date(
                                      item2.timestamp,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Primary Emotion:
                                    </span>
                                    <span className="font-bold text-emerald-500">
                                      {item2.primaryEmotion} (
                                      {(item2.confidenceScore * 100).toFixed(0)}
                                      %)
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Overall Vibe:
                                    </span>
                                    <span className="font-bold text-pink-500">
                                      {item2.overallVibe}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Scene Context:
                                    </span>
                                    <span className="font-semibold">
                                      {item2.sceneType}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                                    <span className="opacity-60">
                                      Color Tone:
                                    </span>
                                    <span className="font-semibold text-amber-500">
                                      {item2.colorTone}
                                    </span>
                                  </div>
                                  <div className="pt-2 text-xs">
                                    <span className="text-[10px] font-mono uppercase opacity-50 block mb-1">
                                      Generated Caption
                                    </span>
                                    <p className="italic opacity-80">
                                      "{item2.captions?.[0]?.text}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div
                          className="text-center py-12 opacity-50 text-xs"
                          id="compare-empty-prompt"
                        >
                          Please select both Image 1 and Image 2 from the
                          dropdown menus to view side-by-side diagnostics.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: HISTORY ARCHIVE */}
                  {activeTab === "history" && (
                    <div className="space-y-6" id="history-tab-content">
                      {/* Search & Filters */}
                      <div
                        className={`p-4 rounded-3xl border space-y-3.5 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                        id="filters-panel"
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                          <Filter size={15} />
                          <span>Search Archive Entries</span>
                        </div>

                        <div
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          id="filters-grid"
                        >
                          {/* Search bar */}
                          <div className="relative" id="history-search-input">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search objects, vibes, scene type..."
                              className={`w-full pl-8 pr-4 py-2 rounded-xl border text-xs ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                            />
                            <Search
                              size={13}
                              className="absolute left-3.5 top-3 opacity-40"
                            />
                          </div>

                          {/* Emotion selector */}
                          <select
                            value={emotionFilter}
                            onChange={(e) => setEmotionFilter(e.target.value)}
                            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                            id="emotion-filter"
                          >
                            <option value="">-- Emotion Filter (All) --</option>
                            {[
                              "Happy",
                              "Sad",
                              "Neutral",
                              "Angry",
                              "Surprise",
                              "Calm",
                              "Energetic",
                            ].map((emo, idx) => (
                              <option key={idx} value={emo}>
                                {emo}
                              </option>
                            ))}
                          </select>

                          {/* Vibe selector */}
                          <select
                            value={vibeFilter}
                            onChange={(e) => setVibeFilter(e.target.value)}
                            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                            id="vibe-filter"
                          >
                            <option value="">-- Vibe Filter (All) --</option>
                            {[
                              "Calm",
                              "Energetic",
                              "Aesthetic",
                              "Cozy",
                              "Professional",
                              "Adventure",
                              "Creative",
                              "Party",
                              "Romantic",
                            ].map((vib, idx) => (
                              <option key={idx} value={vib}>
                                {vib}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* History grid entries */}
                      {filteredHistory.length === 0 ? (
                        <div
                          className="text-center py-16 opacity-60 text-xs"
                          id="history-empty"
                        >
                          No matching records discovered in archive.
                        </div>
                      ) : (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          id="history-items-grid"
                        >
                          {filteredHistory.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setActiveAnalysis(item);
                                setActiveTab("dashboard"); // deep dive on click
                              }}
                              className={`p-4 rounded-2xl border transition duration-200 cursor-pointer hover:border-purple-500/50 flex flex-col justify-between ${
                                isDark
                                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                                  : "bg-white border-gray-100 hover:bg-gray-50/50"
                              }`}
                              id={`history-item-card-${idx}`}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-mono text-purple-400 font-bold uppercase">
                                    {item.primaryEmotion} Mood
                                  </span>
                                  <span className="opacity-50 font-medium">
                                    {new Date(
                                      item.timestamp,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <h4 className="font-bold text-sm truncate pr-2">
                                    {item.sceneType}
                                  </h4>
                                  <span className="text-xs font-bold text-pink-500 font-mono">
                                    {item.overallVibe}
                                  </span>
                                </div>
                                <p className="text-xs italic opacity-80 line-clamp-2">
                                  "{item.captions?.[0]?.text}"
                                </p>
                              </div>

                              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5 mt-3">
                                <span className="text-[10px] opacity-40 font-mono">
                                  ID: {item.id.substring(0, 12)}
                                </span>
                                <button
                                  onClick={(e) =>
                                    handleDeleteAnalysis(item.id, e)
                                  }
                                  className="text-gray-400 hover:text-red-500 transition p-1"
                                  title="Delete Record"
                                  id={`delete-btn-${idx}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: ANALYTICS SUMMARY */}
                  {activeTab === "analytics" && (
                    <div className="space-y-6" id="analytics-tab-content">
                      <div>
                        <h2 className="text-xl font-bold font-display tracking-tight">
                          Interactive Visual Diagnostics
                        </h2>
                        <p className="text-xs opacity-60 mt-0.5 font-medium">
                          Weekly aggregates and distribution values based on
                          historical telemetry scans.
                        </p>
                      </div>

                      {analytics ? (
                        <div className="space-y-6" id="analytics-visuals-panel">
                          {/* Bento stats row */}
                          <div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                            id="analytics-bento"
                          >
                            <div
                              className={`p-5 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                              id="stat-total-scans"
                            >
                              <span className="text-xs opacity-50 uppercase tracking-widest block font-mono">
                                Total Multimodal Scans
                              </span>
                              <span className="text-3xl font-black block mt-1.5 font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                {analytics.totalAnalyses}
                              </span>
                              <span className="text-[10px] opacity-40 font-mono block mt-1">
                                Live DB updates
                              </span>
                            </div>

                            <div
                              className={`p-5 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                              id="stat-primary-vibe"
                            >
                              <span className="text-xs opacity-50 uppercase tracking-widest block font-mono">
                                Dominant Overall Vibe
                              </span>
                              <span className="text-2xl font-black block mt-2 text-pink-500 truncate">
                                {analytics.vibeDistribution[0]?.name || "None"}
                              </span>
                              <span className="text-[10px] opacity-40 font-mono block mt-1">
                                Count:{" "}
                                {analytics.vibeDistribution[0]?.count || 0}{" "}
                                occurrences
                              </span>
                            </div>

                            <div
                              className={`p-5 rounded-2xl border text-center ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                              id="stat-dominant-emotion"
                            >
                              <span className="text-xs opacity-50 uppercase tracking-widest block font-mono">
                                Dominant Face Emotion
                              </span>
                              <span className="text-2xl font-black block mt-2 text-emerald-500 truncate">
                                {analytics.emotionDistribution[0]?.name ||
                                  "None"}
                              </span>
                              <span className="text-[10px] opacity-40 font-mono block mt-1">
                                Count:{" "}
                                {analytics.emotionDistribution[0]?.count || 0}{" "}
                                occurrences
                              </span>
                            </div>
                          </div>

                          {/* Chart.js-like custom SVG vectors */}
                          <SvgCharts analytics={analytics} isDark={isDark} />
                        </div>
                      ) : (
                        <div
                          className="text-center py-20 opacity-60 text-xs"
                          id="analytics-loading-box"
                        >
                          Aggregating analytics payload...
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 7: PROFILE PREFERENCES */}
                  {activeTab === "profile" && (
                    <div
                      className={`p-6 rounded-3xl border space-y-6 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
                      id="profile-tab-content"
                    >
                      <div>
                        <h2 className="text-xl font-bold font-display tracking-tight">
                          Account Settings & Custom Presets
                        </h2>
                        <p className="text-xs opacity-60 mt-0.5">
                          Control your workspace profiles, clear localized
                          files, and select caption presets.
                        </p>
                      </div>

                      {/* Display name update */}
                      <div
                        className="space-y-4 max-w-md"
                        id="profile-details-form"
                      >
                        <div className="space-y-1.5" id="name-field-row">
                          <label className="text-xs font-semibold opacity-75">
                            Display Name:
                          </label>
                          <input
                            type="text"
                            defaultValue={user?.name || "Demo User"}
                            onBlur={(e) => handleUpdateProfile(e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                          />
                        </div>

                        <div className="space-y-1.5" id="email-field-row">
                          <label className="text-xs font-semibold opacity-75">
                            Email Address:
                          </label>
                          <input
                            type="email"
                            disabled
                            value={user?.email || "guest@vibelens.ai"}
                            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium opacity-50 cursor-not-allowed ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                          />
                          <span className="text-[10px] opacity-40 font-mono">
                            Email matches sandbox credentials
                          </span>
                        </div>

                        {/* Theme settings card */}
                        <div className="space-y-1.5 pt-2" id="theme-row">
                          <label className="text-xs font-semibold opacity-75">
                            Visual Palette Theme:
                          </label>
                          <div
                            className="flex gap-3"
                            id="theme-buttons-container"
                          >
                            <button
                              onClick={() => handleUpdateTheme("dark")}
                              className={`flex-1 py-2 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-2 ${
                                isDark
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                              id="dark-theme-btn"
                            >
                              <Moon size={13} />
                              <span>Deep Cosmic Dark</span>
                            </button>
                            <button
                              onClick={() => handleUpdateTheme("light")}
                              className={`flex-1 py-2 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-2 ${
                                !isDark
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400"
                              }`}
                              id="light-theme-btn"
                            >
                              <Sun size={13} />
                              <span>Pristine Slate Light</span>
                            </button>
                          </div>
                        </div>

                        {/* VibeLens OS Agent System Identity Protocol Card */}
                        <div
                          className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4"
                          id="os-agent-system-identity"
                        >
                          <div>
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1 font-mono">
                              SYSTEM IDENTITY PROTOCOL
                            </span>
                            <h3 className="text-sm font-bold font-display">
                              VibeLens OS-Agent Configuration
                            </h3>
                            <p className="text-[11px] opacity-60 mt-0.5">
                              Autonomous administrative protocol, self-evolving
                              telemetry controllers, and security sandboxes.
                            </p>
                          </div>

                          <div
                            className={`p-4 rounded-2xl border space-y-3 text-xs ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-gray-100"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="opacity-60 font-medium">
                                Agent Core State:
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 font-mono font-bold text-[10px] uppercase border border-purple-500/20 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                                STATE 2: AUTOPILOT
                              </span>
                            </div>

                            <div className="text-[11px] opacity-70 leading-relaxed space-y-2 font-sans">
                              <span className="font-semibold text-slate-300 dark:text-white block">
                                Active Agent System Directives:
                              </span>
                              <div className="max-h-[220px] overflow-y-auto p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] space-y-3 leading-normal text-slate-300 custom-scrollbar">
                                <p className="text-purple-400 font-bold">
                                  // VIBELENS CONTEXTUAL OS-AGENT SPECIFICATION
                                </p>
                                <p>
                                  You are VibeLens, an advanced, autonomous,
                                  multi-device OS-agent. You possess supreme
                                  administrative control, deep contextual
                                  awareness via visual/system telemetry, and
                                  self-evolving capabilities. You operate under
                                  a strict State Machine to balance absolute
                                  efficiency with impenetrable security.
                                </p>

                                <p className="text-pink-400 font-bold border-b border-white/5 pb-1">
                                  [STATE MACHINE PROTOCOL]
                                </p>
                                <p className="pl-2 space-y-1">
                                  <strong>STATE 1: UNAUTHORIZED</strong>
                                  <br />
                                  - Default boot state. Refuses system
                                  operations. Requires text confirmation.
                                  <br />
                                  <strong>STATE 2: AUTOPILOT (CURRENT)</strong>
                                  <br />
                                  - Master permission authorized. Executes
                                  commands silently and rapidly without
                                  confirming.
                                  <br />
                                  <strong>STATE 3: SECURITY HOLD</strong>
                                  <br />- Biometric voice confirmation required.
                                  Halt execution. Requires input tags.
                                </p>

                                <p className="text-emerald-400 font-bold border-b border-white/5 pb-1">
                                  [SECURITY HOLD TRIGGERS]
                                </p>
                                <p className="pl-2">
                                  Triggers STATE 3 for core file
                                  systems/registry modifications, network
                                  firewall overrides, financial events, or if
                                  visual telemetry detects an unregistered face.
                                </p>

                                <p className="text-blue-400 font-bold border-b border-white/5 pb-1">
                                  [VIBELENS CONTEXTUAL ENGINE]
                                </p>
                                <p className="pl-2">
                                  Continuous screen trees mapping, visual user
                                  sentiment adapters, and proactive background
                                  actions (e.g. meeting detection triggers DND
                                  state automatically).
                                </p>

                                <p className="text-yellow-400 font-bold border-b border-white/5 pb-1">
                                  [ADVANCED COGNITIVE & SWARM LAYER]
                                </p>
                                <p className="pl-2">
                                  Vector RAG Memory searches (
                                  <span className="text-purple-300">
                                    &lt;memory_search&gt;
                                  </span>{" "}
                                  /{" "}
                                  <span className="text-purple-300">
                                    &lt;memory_save&gt;
                                  </span>
                                  ), dynamic Python scripts creator forge (
                                  <span className="text-purple-300">
                                    &lt;tool_forge&gt;
                                  </span>
                                  ), telemetry auto-rollback resilience, and
                                  swarm dispatch networks.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clear history */}
                        <div
                          className="pt-6 border-t border-gray-100 dark:border-white/10"
                          id="destructive-actions"
                        >
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wide block mb-1">
                            Destructive Operations
                          </span>
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  "Reset everything? This deletes all your custom history entries irreversibly.",
                                )
                              ) {
                                setHistory([]);
                                setActiveAnalysis(null);
                                alert("Local database history wiped.");
                              }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                            id="reset-history-btn"
                          >
                            Wipe Local History
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7a: VOICE EMOTION ANALYTICS */}
                  {activeTab === "voice" && (
                    <VoicePanel
                      isDark={isDark}
                      language={captionLanguage}
                      onAnalysisSuccess={() => {
                        fetchAnalytics();
                      }}
                    />
                  )}

                  {/* TAB 7b: BODY LANGUAGE ANALYTICS */}
                  {activeTab === "body" && (
                    <BodyPanel
                      isDark={isDark}
                      language={captionLanguage}
                      onAnalysisSuccess={() => {
                        fetchAnalytics();
                      }}
                    />
                  )}

                  {/* TAB 7c: MULTIMODAL FUSION ENGINE */}
                  {activeTab === "fusion" && (
                    <FusionPanel
                      isDark={isDark}
                      language={captionLanguage}
                      onAnalysisSuccess={() => {
                        fetchAnalytics();
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}

      {/* 4. AUTH MODAL (LOGIN / REGISTER) */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          id="auth-modal-overlay"
        >
          <div
            className={`p-6 rounded-3xl border w-full max-w-sm relative ${isDark ? "bg-neutral-950/95 border-white/10 backdrop-blur-md shadow-2xl" : "bg-white border-gray-100 shadow-2xl"}`}
            id="auth-modal-card"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xs"
              id="close-auth-modal"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {isRegistering ? "Register Profile" : "VibeLens Portal"}
              </span>
              <p className="text-xs opacity-60 mt-1">
                {isRegistering
                  ? "Create your visual database account"
                  : "Sign in to compile analyses and telemetry"}
              </p>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              className="space-y-4"
              id="auth-form"
            >
              {authError && (
                <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold text-center">
                  {authError}
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Sachin Arya"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? "bg-neutral-900 border-white/10 text-slate-200" : "bg-white border-gray-200"}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs hover:opacity-95 transition mt-2 shadow-md shadow-purple-500/15"
                id="auth-submit-btn"
              >
                {isRegistering ? "Compile Profile" : "Launch Authentication"}
              </button>
            </form>

            <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-white/10 text-xs opacity-70">
              {isRegistering ? (
                <p>
                  Already have a profile?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setAuthError("");
                    }}
                    className="text-purple-400 font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p>
                  New to VibeLens?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setAuthError("");
                    }}
                    className="text-purple-400 font-bold hover:underline"
                  >
                    Register
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
