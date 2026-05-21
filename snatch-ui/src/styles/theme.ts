export const theme = {
  colors: {
    bg: "#1a1b1e",
    sidebar: "#121316",
    panel: "#212226",
    active: "#2b2c31",
    accent: "#00ff88",
    text: {
      primary: "#e2e2e2",
      secondary: "#6b6b6b",
      muted: "#4a4a4a",
    },
  },
  fonts: {
    mono: "'JetBrains Mono', monospace",
  },
  spacing: {
    dense: "0.5rem",
    standard: "1rem",
  },
} as const;

export type Theme = typeof theme;
