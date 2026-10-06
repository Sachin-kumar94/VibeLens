import React, { useState, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { VibeLensLogo } from "./BrandIcons";

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenApp: (tab?: string) => void;
  onSignIn?: () => void;
  onGetStarted?: () => void;
  onSearchOpen?: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenApp,
  onSignIn,
  onGetStarted,
  onSearchOpen,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F6F3EC]/95 backdrop-blur-md border-b border-[#DDD8CD] shadow-[0_2px_12px_rgba(23,25,26,0.03)] h-20"
          : "bg-[#F6F3EC]/80 backdrop-blur-xs border-b border-[#DDD8CD]/60 h-20"
      }`}
    >
      <div className="max-w-[1420px] mx-auto px-6 sm:px-10 lg:px-14 h-full flex items-center justify-between">
        {/* Left: VibeLens Logo */}
        <div
          onClick={() => onNavigate("hero")}
          className="cursor-pointer group"
        >
          <VibeLensLogo size={26} variant="dark" />
        </div>

        {/* Center: Clean Navigation Links matching Reference */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#555A58]">
          <button
            type="button"
            onClick={() => onNavigate("features")}
            className="hover:text-[#17191A] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => onNavigate("pricing")}
            className="hover:text-[#17191A] transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            type="button"
            onClick={() => onNavigate("resources")}
            className="hover:text-[#17191A] transition-colors cursor-pointer"
          >
            Resources
          </button>
        </nav>

        {/* Right: Search, Sign in, Get Started */}
        <div className="flex items-center gap-5">
          {/* Search icon */}
          <button
            type="button"
            title="Search"
            onClick={onSearchOpen || (() => onNavigate("how-it-works"))}
            className="text-[#17191A] hover:text-[#555A58] transition-colors cursor-pointer p-1"
          >
            <Search size={18} strokeWidth={1.75} />
          </button>

          {/* Sign In */}
          <button
            type="button"
            onClick={() => (onSignIn ? onSignIn() : onOpenApp("image"))}
            className="text-[13px] font-medium text-[#17191A] hover:text-[#555A58] transition-colors cursor-pointer"
          >
            Sign in
          </button>

          {/* Get Started -> */}
          <button
            type="button"
            onClick={() => (onGetStarted ? onGetStarted() : onOpenApp("image"))}
            className="px-5 py-2.5 rounded-full bg-[#17191A] hover:bg-[#2A2E2C] text-[#F6F3EC] text-[13px] font-medium tracking-tight shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98 flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
