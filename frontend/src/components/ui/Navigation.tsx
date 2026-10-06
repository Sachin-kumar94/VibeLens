import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Menu, X, Shield, Activity, Compass } from "lucide-react";

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAuth?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigate,
  onOpenAuth,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Product", path: "/dashboard", badge: "Studio" },
    { label: "Voice", path: "/voice" },
    { label: "Body", path: "/body" },
    { label: "Fusion", path: "/fusion", badge: "Core" },
    { label: "Coach", path: "/presentation-coach" },
    { label: "Interview", path: "/interview" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#070812]/80 backdrop-blur-xl border-b border-white/[0.06] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
        {/* Left: Handcrafted Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#4FA7FF] flex items-center justify-center p-[1px] shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#070812] rounded-[11px] flex items-center justify-center">
              <span className="font-serif italic font-bold text-[#F4F1EA] text-base leading-none">
                V
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-white text-base tracking-tight leading-none group-hover:text-[#F4F1EA] transition-colors">
              VibeLens
            </span>
            <span className="text-[10px] font-mono text-[#777985] tracking-widest uppercase mt-0.5">
              Human Signals
            </span>
          </div>
        </button>

        {/* Center: Editorial Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-[#0D1221]/70 border border-white/[0.08] backdrop-blur-md">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentPath === "/"
                ? "text-white bg-white/[0.1] font-semibold"
                : "text-[#B8B7BF] hover:text-white"
            }`}
          >
            Overview
          </button>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate(link.path)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-white bg-white/[0.1] font-semibold shadow-sm"
                    : "text-[#B8B7BF] hover:text-white"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] border border-[#7C5CFC]/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("/dashboard")}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#4FA7FF] text-white text-xs font-bold hover:opacity-95 transition-all shadow-[0_0_20px_rgba(124,92,252,0.3)] flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Start Exploring</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#070812]/95 backdrop-blur-2xl border-b border-white/[0.08] px-6 py-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-4 border-b border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                onNavigate("/");
                setMobileOpen(false);
              }}
              className="p-3 rounded-xl bg-white/[0.04] text-left text-xs font-medium text-white"
            >
              Overview
            </button>
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  onNavigate(link.path);
                  setMobileOpen(false);
                }}
                className="p-3 rounded-xl bg-white/[0.04] text-left text-xs font-medium text-[#B8B7BF] hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigate("/dashboard");
                setMobileOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#4FA7FF] text-white text-xs font-bold text-center"
            >
              Launch Multimodal Studio
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
