import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "judge. — online judge for CPE & UVa practice",
  description: "Solve UVa problems, take timed CPE virtual exams, track your progress.",
};

// Runs before paint so a stored theme choice applies immediately — otherwise the page would
// flash the wrong theme for a frame while React hydrates. No stored choice means "follow system
// preference," handled entirely by the @media (prefers-color-scheme) rule in globals.css, so
// this script deliberately does nothing in that case rather than guessing.
const THEME_BOOTSTRAP_SCRIPT = `
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main className="mx-auto min-h-[calc(100vh-56px)] max-w-6xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
