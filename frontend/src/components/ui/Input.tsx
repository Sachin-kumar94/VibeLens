import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="space-y-1.5 text-left w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#17191A]">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-2xs">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81827D]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white border ${
              error ? "border-[#B77988] focus:ring-[#B77988]" : "border-[#DDD7CB] focus:border-[#17191A]"
            } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#17191A] placeholder-[#81827D]/60 focus:outline-none focus:ring-1 transition-all ${
              icon ? "pl-10" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-[11px] text-[#B77988] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#81827D]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
