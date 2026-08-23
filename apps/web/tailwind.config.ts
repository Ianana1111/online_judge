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
          rf: themedColor("verdict-rf"),
          ce: themedColor("verdict-ce"),
          pe: themedColor("verdict-pe"),
          ole: themedColor("verdict-ole"),
          se: themedColor("verdict-se"),
          pending: themedColor("verdict-pending"),
        },
      },
      // The Google-font variables above only cover Latin glyphs (subsets: ["latin"] in
      // layout.tsx) — every CJK character on the page falls through to these fallbacks. A bare
      // "sans-serif" fallback commonly resolves to a Simplified-Chinese face on Android (Noto
      // Sans SC), rendering Traditional Chinese with visibly wrong glyph shapes (門→门, 直→直
      // with a different stroke, etc.) for a site whose primary language is zh-TW. Naming the
      // real TC system faces first (per-OS: PingFang TC on Apple, Microsoft JhengHei on Windows,
      // Noto Sans TC as the actual cross-platform CJK web font) fixes this without touching the
      // Latin rendering these variables already handle.
      fontFamily: {
        display: ["var(--font-display)", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "sans-serif"],
        body: ["var(--font-body)", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "sans-serif"],
        mono: ["var(--font-mono)", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "monospace"],
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
