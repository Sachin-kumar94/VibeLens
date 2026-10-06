/**
 * VibeLens Design Tokens
 * Grounded, human-first editorial design system.
 */

export const designTokens = {
  colors: {
    // Primary Surfaces & Bases
    bgPrimary: "#F6F3EC", // Warm off-white
    surfaceWhite: "#FFFFFF",
    surfaceAlabaster: "#FAF8F5",
    surfaceCard: "#FFFFFF",
    surfaceMuted: "#F0EDE6",
    surfaceDark: "#17191A",
    surfaceDarkSubtle: "#24272A",

    // Text & Typography
    textPrimary: "#17191A", // Charcoal
    textSecondary: "#24272A", // Dark
    textMuted: "#81827D", // Warm gray
    textLight: "#F6F3EC",
    textInverse: "#FFFFFF",

    // Borders & Dividers
    borderSubtle: "#E6E1D6",
    borderMedium: "#DDD7CB",
    borderDark: "#2A2D34",

    // Human-Centered Modality Accents
    softBlue: "#738A9B", // Image / Attunement
    naturalGreen: "#748C78", // Composure / Equanimity
    warmAccent: "#C38A68", // Posture / Flesh tone / Earth
    mutedViolet: "#786D9D", // Vocal harmonics / Resonance
    mutedRose: "#B77988", // Heart / Attentiveness

    // System Status
    success: "#748C78",
    warning: "#C38A68",
    error: "#B77988",
    info: "#738A9B",
  },

  typography: {
    fontSans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSerif: "'DM Serif Display', Georgia, serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  radius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.25rem", // 20px
    full: "9999px",
  },

  shadows: {
    "2xs": "0 1px 2px rgba(23, 25, 26, 0.03)",
    xs: "0 1px 3px rgba(23, 25, 26, 0.05)",
    sm: "0 2px 6px rgba(23, 25, 26, 0.06)",
    md: "0 4px 14px rgba(23, 25, 26, 0.07)",
    lg: "0 10px 25px rgba(23, 25, 26, 0.08)",
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    tooltip: 1080,
  },

  motion: {
    durationFast: "150ms",
    durationNormal: "250ms",
    durationSlow: "400ms",
    easeNatural: "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  breakpoints: {
    mobile: "390px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1400px",
  },
} as const;

export type DesignTokens = typeof designTokens;
