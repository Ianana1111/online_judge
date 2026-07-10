import type { Config } from "tailwindcss";

// Colors reference CSS custom properties (defined per-theme in globals.css) instead of fixed hex,
// so every existing bg-ink-*/text-ink-*/border-brand-* etc. utility automatically becomes
// theme-aware with no per-component changes. RGB triplets (not hex) so Tailwind's opacity
// modifiers (bg-ink-950/90, border-brand/40, ...) keep working — that syntax needs `rgb(var(...)
// / <alpha-value>)`, a plain var() can't take an alpha modifier.
function themedColor(name: string) {
  return `rgb(var(--${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: themedColor("ink-950"),
          900: themedColor("ink-900"),
          800: themedColor("ink-800"),
          700: themedColor("ink-700"),
          600: themedColor("ink-600"),
          500: themedColor("ink-500"),
          400: themedColor("ink-400"),
          300: themedColor("ink-300"),
          200: themedColor("ink-200"),
          100: themedColor("ink-100"),
          50: themedColor("ink-50"),
        },
        brand: {
          DEFAULT: themedColor("brand"),
          light: themedColor("brand-light"),
          dark: themedColor("brand-dark"),
        },
        onbrand: themedColor("onbrand"),
        verdict: {
          ac: themedColor("verdict-ac"),
          wa: themedColor("verdict-wa"),
          tle: themedColor("verdict-tle"),
          mle: themedColor("verdict-mle"),
          re: themedColor("verdict-re"),
          ce: themedColor("verdict-ce"),
          pe: themedColor("verdict-pe"),
          ole: themedColor("verdict-ole"),
          se: themedColor("verdict-se"),
          pending: themedColor("verdict-pending"),
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
