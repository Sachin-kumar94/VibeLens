import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  error = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const digits = (value || "").padEnd(6, "").slice(0, 6).split("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(rawVal);
    if (rawVal.length === 6 && onComplete) {
      onComplete(rawVal);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
    }
  };

  const handleBoxClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const activeIndex = Math.min(value.length, 5);

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      {/* Real accessible input overlaying or behind */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        aria-label="6-digit verification code"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Visual 6-box representation */}
      <div className="flex items-center justify-center gap-2 sm:gap-3" onClick={handleBoxClick}>
        {digits.map((digit, idx) => {
          const isFilled = Boolean(value[idx]);
          const isFocused = idx === activeIndex && !disabled;

          return (
            <div
              key={idx}
              className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 select-none ${
                error
                  ? "border-[#CF1322] bg-[#FFF1F0] text-[#CF1322]"
                  : isFocused
                  ? "border-[#15171A] bg-white ring-2 ring-[#15171A]/10 text-[#15171A] scale-102"
                  : isFilled
                  ? "border-[#DDD8CD] bg-[#FAF8F5] text-[#15171A]"
                  : "border-[#E6E2D8] bg-[#FAF8F5]/60 text-[#8C8983]"
              }`}
            >
              {digit ? (
                digit
              ) : isFocused ? (
                <span className="w-0.5 h-6 bg-[#15171A] animate-pulse" />
              ) : (
                <span className="text-[#DDD8CD] text-sm">_</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
