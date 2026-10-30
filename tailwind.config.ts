import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tsunami: {
          bg: "var(--tsunami-bg)",
          card: "var(--tsunami-card)",
          surface: "var(--tsunami-surface)",
          border: "var(--tsunami-border)",
          text: "var(--tsunami-text)",
          "text-sec": "var(--tsunami-text-secondary)",
          gold: "var(--tsunami-gold)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#070e17",
          900: "#0d1b2a",
          850: "#102235",
          800: "#13253a",
          700: "#1e3a5f",
          600: "#2a4d7d",
        },
        surface: {
          DEFAULT: "#0d1b2a",
          secondary: "#13253a",
          card: "#0f2035",
          highlight: "#1a3352",
        },
        border: {
          DEFAULT: "#1e3a5f",
          accent: "#2c5282",
        },
        gold: {
          DEFAULT: "#d4af37",
          hover: "#e5c05b",
          light: "#f3e5ab",
          dark: "#aa820a",
        },
        ocean: {
          DEFAULT: "#00a8b5",
          cyan: "#06b6d4",
          dark: "#0f3460",
          glow: "rgba(6, 182, 212, 0.25)",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f3e5ab 0%, #d4af37 50%, #aa820a 100%)",
        "gold-gradient-hover": "linear-gradient(135deg, #ffffff 0%, #e5c05b 50%, #b8860b 100%)",
        "ocean-gradient": "linear-gradient(135deg, #06b6d4 0%, #00a8b5 50%, #0f3460 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(19, 37, 58, 0.7) 0%, rgba(13, 27, 42, 0.9) 100%)",
        "hero-glow": "radial-gradient(circle at 50% 20%, rgba(0, 168, 181, 0.15) 0%, rgba(212, 175, 55, 0.08) 35%, transparent 70%)",
      },
      boxShadow: {
        "gold-sm": "0 0 12px rgba(212, 175, 55, 0.25)",
        "gold-lg": "0 0 25px rgba(212, 175, 55, 0.35)",
        "ocean-sm": "0 0 12px rgba(6, 182, 212, 0.25)",
        "ocean-lg": "0 0 30px rgba(6, 182, 212, 0.35)",
        "card-luxury": "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(30, 58, 95, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
