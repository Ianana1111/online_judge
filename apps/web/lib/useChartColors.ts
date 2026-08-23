"use client";

import { useTheme } from "@/lib/useTheme";

// Recharts elements (SVG fill/stroke, inline tooltip styles) can't consume Tailwind classes, so
// they were previously hardcoded to fixed hex values tuned only for the dark theme — invisible
// axis labels and a jarring tooltip once light mode shipped. These mirror the same tokens defined
// as CSS custom properties in globals.css (ink-*, verdict-pending) for each theme, so charts stay
// legible and consistent with the rest of the UI in both.
const PALETTE = {
  dark: {
    axisMain: "rgb(154, 168, 181)", // ink-300
    axisMuted: "rgb(107, 122, 139)", // ink-400
    gridLine: "rgb(28, 37, 48)", // ink-700
    cursorFill: "rgb(20, 26, 34)", // ink-800
    tooltipBg: "rgb(20, 26, 34)", // ink-800
    tooltipBorder: "rgb(42, 52, 65)", // ink-600
    tooltipText: "rgb(232, 236, 239)", // ink-100
    chartStroke: "rgb(14, 18, 24)", // ink-900, used as a Cell's separator stroke
    barNeutral: "rgb(71, 84, 99)", // ink-500, an unselected/inactive bar fill
  },
  light: {
    axisMain: "rgb(72, 84, 95)", // ink-300
    axisMuted: "rgb(78, 89, 100)", // ink-400
    gridLine: "rgb(210, 215, 220)", // ink-700
    cursorFill: "rgb(227, 230, 233)", // ink-800
    tooltipBg: "rgb(238, 240, 242)", // ink-900
    tooltipBorder: "rgb(183, 191, 198)", // ink-600
    tooltipText: "rgb(28, 37, 46)", // ink-100
    chartStroke: "rgb(247, 248, 249)", // ink-950
    barNeutral: "rgb(100, 111, 123)", // ink-500
  },
} as const;

export function useChartColors() {
  const theme = useTheme();
  return PALETTE[theme];
}
