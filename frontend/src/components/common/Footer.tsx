import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F4EE] border-t border-[#E6E1D6] py-16 text-[#8C8983]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-10 text-center">
        
        {/* Centered Brand & Tagline */}
        <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#15171A] text-[#F7F4EE] flex items-center justify-center font-serif text-xs font-semibold">
              V
            </div>
            <span className="font-serif text-2xl font-bold text-[#15171A] tracking-tight">VibeLens</span>
          </div>
          <p className="text-xs text-[#8C8983] leading-relaxed">
            A thoughtful digital product about understanding people.
            Designed with care for human nuance, psychology, and quiet technology.
          </p>
        </div>

        {/* Centered Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-[#25282C]">
          <a href="#features" className="hover:text-[#15171A] transition">Features</a>
          <a href="#pricing" className="hover:text-[#15171A] transition">Pricing</a>
          <a href="#resources" className="hover:text-[#15171A] transition">Resources</a>
          <a href="#product" className="hover:text-[#15171A] transition">Product</a>
        </div>

        {/* Centered Copyright */}
        <div className="pt-8 border-t border-[#E6E1D6]/80 flex items-center justify-center text-[11px] font-mono text-[#8C8983]">
          <div>
            © {new Date().getFullYear()} VibeLens Studio.
          </div>
        </div>

      </div>
    </footer>
  );
};
