import React, { useState } from "react";
import {
  Search,
  Camera,
  Mic,
  Activity,
  Layers,
  BarChart3,
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Heart,
  Presentation,
  Compass,
  UserCheck
} from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface AppHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentPath, onNavigate }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <Compass size={14} /> },
    { label: "Image", path: "/image", icon: <Camera size={14} /> },
    { label: "Batch", path: "/batch", icon: <Camera size={14} /> },
    { label: "Voice", path: "/voice", icon: <Mic size={14} /> },
    { label: "Body", path: "/body", icon: <Activity size={14} /> },
    { label: "Fusion", path: "/fusion", icon: <Layers size={14} /> },
    { label: "Coach", path: "/presentation-coach", icon: <Presentation size={14} /> },
    { label: "Interview", path: "/interview", icon: <UserCheck size={14} /> },
    { label: "Journal", path: "/journal", icon: <BookOpen size={14} /> },
    { label: "Analytics", path: "/analytics", icon: <BarChart3 size={14} /> },
    { label: "History", path: "/history", icon: <BarChart3 size={14} /> },
    { label: "Health", path: "/vibe-health", icon: <Heart size={14} /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E6E1D6]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#15171A] text-[#F7F4EE] font-serif text-sm font-semibold flex items-center justify-center transition-transform group-hover:scale-105">
                V
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-lg font-bold text-[#15171A] leading-tight">
                  VibeLens
                </span>
                <span className="text-[10px] text-[#8C8983] uppercase tracking-wider font-medium hidden sm:block">
                  Quiet Technology
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#15171A] text-[#F7F4EE] shadow-2xs font-semibold"
                      : "text-[#25282C] hover:text-[#15171A] hover:bg-[#EFEAE1]/70"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Cmd+K Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#8C8983] hover:text-[#15171A] hover:border-[#8C8983] transition cursor-pointer shadow-2xs"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] bg-[#EFEAE1] px-1.5 py-0.5 rounded border border-[#DDD7CB] text-[#8C8983]">
                ⌘K
              </kbd>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#DDD7CB] bg-[#FAF8F5] hover:bg-white text-xs font-medium text-[#15171A] transition cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#EFEAE1] border border-[#DDD7CB] flex items-center justify-center text-[10px] font-bold text-[#15171A]">
                  S
                </div>
                <span className="hidden md:inline">Sachin</span>
                <ChevronDown size={13} className="text-[#8C8983]" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-[#FAF8F5] border border-[#DDD7CB] rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#DDD7CB]/60">
                    <p className="text-xs font-semibold text-[#15171A]">Sachin Sharma</p>
                    <p className="text-[11px] text-[#8C8983] truncate">sachin@vibelens.ai</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate("/profile");
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#15171A] hover:bg-[#EFEAE1] flex items-center gap-2 cursor-pointer"
                  >
                    <User size={13} />
                    <span>Profile & Privacy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate("/settings");
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#15171A] hover:bg-[#EFEAE1] flex items-center gap-2 cursor-pointer"
                  >
                    <span>App Settings</span>
                  </button>
                  <div className="border-t border-[#DDD7CB]/60 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate("/");
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#C48A66] hover:bg-[#EFEAE1] flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Exit to Landing</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 rounded-lg border border-[#DDD7CB] text-[#15171A] hover:bg-white cursor-pointer"
            >
              {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-[#DDD7CB] bg-[#FAF8F5] px-4 py-3 space-y-1">
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => {
                    onNavigate(link.path);
                    setIsMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition cursor-pointer flex items-center gap-2 ${
                    currentPath === link.path
                      ? "bg-[#15171A] text-[#F7F4EE]"
                      : "text-[#25282C] hover:bg-[#EFEAE1]"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
