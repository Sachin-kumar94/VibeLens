/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "vibe-bg": "#070812",
        "vibe-secondary": "#0D1221",
        "vibe-surface": "#121827",
        "vibe-elevated": "#182238",
        "vibe-violet": "#7C5CFC",
        "vibe-blue": "#4FA7FF",
        "vibe-cyan": "#56D9E8",
        "vibe-warm": "#E8A46B",
        "vibe-pink": "#E77BB7",
        "vibe-text": "#F4F1EA",
        "vibe-subtext": "#B8B7BF",
        "vibe-muted": "#777985",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"],
        serif: ["'DM Serif Display'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        subtle: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        glass: "0 20px 50px rgba(0, 0, 0, 0.4)",
        "glow-violet": "0 0 30px rgba(124, 92, 252, 0.25)",
        "glow-cyan": "0 0 30px rgba(86, 217, 232, 0.25)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.03)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        breathe: "breathe 8s ease-in-out infinite",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
