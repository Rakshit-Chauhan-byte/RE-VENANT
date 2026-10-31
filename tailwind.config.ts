import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c0a",
        foreground: "#e2e8f0",
        void: {
          950: "#040705",
          900: "#080c0a",
          850: "#0d1310",
          800: "#131a16",
          700: "#1c2621",
          600: "#273730",
          500: "#384d43",
        },
        ghost: {
          emerald: "#10b981",
          phosphor: "#00ff88",
          mint: "#34d399",
          cyan: "#06b6d4",
          spectral: "#22d3ee",
          dim: "#064e3b",
        },
        terminal: {
          dim: "#4b5563",
          muted: "#94a3b8",
          bright: "#f8fafc",
          accent: "#00ff88",
          warn: "#f59e0b",
          alert: "#ef4444",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        "ghost-glow": "0 0 25px -5px rgba(0, 255, 136, 0.15)",
        "ghost-glow-strong": "0 0 35px -5px rgba(0, 255, 136, 0.35)",
        "spectral-glow": "0 0 25px -5px rgba(6, 182, 212, 0.2)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flicker": "flicker 2s infinite alternate",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
