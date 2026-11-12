import type { Metadata } from "next";

// Tutoring-only material (served by the API to students enrolled in C), so keep it out of search.
export const metadata: Metadata = {
  title: "C 語言學習地圖 | judge.",
  robots: { index: false, follow: false },
};

export default function LearnCLayout({ children }: { children: React.ReactNode }) {
  return children;
}
