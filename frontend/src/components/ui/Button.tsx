import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#17191A] text-[#F6F3EC] hover:bg-[#24272A] shadow-2xs hover:shadow-xs active:scale-[0.99]",
    secondary:
      "bg-white text-[#17191A] border border-[#DDD7CB] hover:bg-[#FAF8F5] hover:border-[#81827D] shadow-2xs",
    outline:
      "bg-transparent text-[#17191A] border border-[#DDD7CB] hover:bg-white hover:border-[#17191A]",
    ghost:
      "bg-transparent text-[#81827D] hover:text-[#17191A] hover:bg-[#F0EDE6]/60",
    danger:
      "bg-[#B77988]/10 text-[#B77988] border border-[#B77988]/30 hover:bg-[#B77988] hover:text-white",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin shrink-0" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
