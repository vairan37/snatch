import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zed: {
          bg: "#1a1b1e",
          sidebar: "#121316",
          panel: "#212226",
          active: "#2b2c31",
        },
        accent: "#00ff88",
        text: {
          primary: "#e2e2e2",
          secondary: "#6b6b6b",
          muted: "#4a4a4a",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config
