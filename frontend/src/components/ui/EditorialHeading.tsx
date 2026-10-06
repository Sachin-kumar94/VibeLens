import React from "react";

interface EditorialHeadingProps {
  eyebrow?: string;
  eyebrowColor?: "violet" | "blue" | "cyan" | "warm" | "pink";
  title: string;
  serifWord?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
  className?: string;
}

export const EditorialHeading: React.FC<EditorialHeadingProps> = ({
  eyebrow,
  eyebrowColor = "violet",
  title,
  serifWord,
  subtitle,
  size = "lg",
  align = "left",
  className = "",
}) => {
  const eyebrowColors = {
    violet: "text-[#7C5CFC] border-[#7C5CFC]/30 bg-[#7C5CFC]/10",
    blue: "text-[#4FA7FF] border-[#4FA7FF]/30 bg-[#4FA7FF]/10",
    cyan: "text-[#56D9E8] border-[#56D9E8]/30 bg-[#56D9E8]/10",
    warm: "text-[#E8A46B] border-[#E8A46B]/30 bg-[#E8A46B]/10",
    pink: "text-[#E77BB7] border-[#E77BB7]/30 bg-[#E77BB7]/10",
  };

  const sizes = {
    sm: "text-xl sm:text-2xl",
    md: "text-2xl sm:text-3xl lg:text-4xl",
    lg: "text-3xl sm:text-4xl lg:text-5xl",
    xl: "text-4xl sm:text-5xl lg:text-6xl",
  };

  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`space-y-3 ${alignment} ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono tracking-widest uppercase font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${eyebrowColors[eyebrowColor].split(" ")[0].replace("text-", "bg-")}`} />
          <span className={eyebrowColors[eyebrowColor].split(" ")[0]}>{eyebrow}</span>
        </div>
      )}

      <h2 className={`font-extrabold text-[#F4F1EA] tracking-tight leading-[1.1] ${sizes[size]}`}>
        {title}{" "}
        {serifWord && (
          <span className="font-serif italic font-normal text-white">
            {serifWord}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="text-sm sm:text-base text-[#B8B7BF] max-w-2xl font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
