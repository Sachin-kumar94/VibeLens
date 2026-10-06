import React from "react";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  borderAccent?: "none" | "violet" | "blue" | "cyan" | "warm" | "pink";
  hoverLift?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  elevated = false,
  borderAccent = "none",
  hoverLift = false,
  children,
  className = "",
  style,
  ...props
}) => {
  const accentBorders = {
    none: "border-white/[0.08]",
    violet: "border-l-2 border-l-[#7C5CFC] border-white/[0.08]",
    blue: "border-l-2 border-l-[#4FA7FF] border-white/[0.08]",
    cyan: "border-l-2 border-l-[#56D9E8] border-white/[0.08]",
    warm: "border-l-2 border-l-[#E8A46B] border-white/[0.08]",
    pink: "border-l-2 border-l-[#E77BB7] border-white/[0.08]",
  };

  const bgStyle = elevated
    ? "bg-[#182238]/75 backdrop-blur-xl"
    : "bg-[#121827]/65 backdrop-blur-md";

  const hoverStyle = hoverLift
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-subtle hover:border-white/[0.16]"
    : "transition-colors duration-200";

  return (
    <div
      className={`relative rounded-2xl border ${accentBorders[borderAccent]} ${bgStyle} ${hoverStyle} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
