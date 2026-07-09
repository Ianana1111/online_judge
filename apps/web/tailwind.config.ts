import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0d12",
          900: "#0e1218",
          800: "#141a22",
          700: "#1c2530",
          600: "#2a3441",
          500: "#475463",
          400: "#6b7a8b",
          300: "#9aa8b5",
          200: "#c7d0d8",
          100: "#e8ecef",
          50: "#f5f7f8",
        },
        brand: {
          DEFAULT: "#e8a33d",
          light: "#f0b660",
          dark: "#c8842a",
        },
        verdict: {
          ac: "#2fae5e",
          wa: "#d9534f",
          tle: "#e08a2f",
          mle: "#c9772f",
          re: "#c44f6b",
          ce: "#8b8f9b",
          pe: "#c9a13b",
          ole: "#b3672f",
          se: "#7a5cc9",
          pending: "#4a6fa5",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      keyframes: {
        "verdict-flash": {
          "0%": { transform: "scale(0.96)", opacity: "0.4" },
          "60%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "verdict-flash": "verdict-flash 0.35s ease-out",
        "pulse-soft": "pulse-soft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
