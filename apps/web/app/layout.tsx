import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PageviewTracker from "@/components/PageviewTracker";
import PromoBanner from "@/components/PromoBanner";
import ActiveExamBanner from "@/components/ActiveExamBanner";
import ProfileSetupGate from "@/components/ProfileSetupGate";
import PendingDeletionGate from "@/components/PendingDeletionGate";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonLd";

const display = localFont({
  src: "./fonts/space-grotesk.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-display",
});

const body = localFont({
  src: "./fonts/ibm-plex-sans.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-body",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-mono",
});

// Used only for problem statements and their title — the source PDFs are LaTeX-typeset in
// Computer Modern/Latin Modern (confirmed via pdffonts on the cached PDFs), which isn't itself
// a Google Font; STIX Two Text is the closest widely-available match (same Times-derived,
// scientific-publishing lineage, and — unlike a generic serif — properly supports the
// sub/superscript-heavy math notation these statements actually contain). Deliberately its own
// variable rather than replacing --font-body/--font-display: this is scoped to statement/title
// rendering only, the rest of the site's chrome keeps its existing sans-serif look.
const statement = localFont({
  src: [
    { path: "./fonts/stix-two-text.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/stix-two-text-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-statement",
});

const DEFAULT_TITLE = "judge. — online judge for CPE & GPE practice";
const DEFAULT_DESCRIPTION =
  "Solve UVa problems, take timed CPE/GPE virtual exams, and track your progress — 430+ curated problems with per-exam appearance stats.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "zh_TW",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  verification: {
    google: "yZ7kRbt21_T1t8m4xKdWv6lOTJiLkXOkGUAGVfxdPDo",
  },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by middleware.ts alongside the actual CSP response header — see that file's doc comment
  // for why the nonce can't just live in a static config.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="zh-TW" className={`${display.variable} ${body.variable} ${mono.variable} ${statement.variable}`}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ORGANIZATION_JSON_LD) }} />
        <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(WEBSITE_JSON_LD) }} />
      </head>
      <body>
        <Providers>
          <a href="#main-content" className="sr-only z-[100] rounded-md bg-ink-900 px-4 py-3 text-ink-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-3">跳到主要內容 / Skip to content</a>
          <PageviewTracker />
          <PromoBanner />
          <ActiveExamBanner />
          <NavBar />
          <ProfileSetupGate />
          <PendingDeletionGate />
          <main id="main-content" tabIndex={-1} className="mx-auto min-h-[calc(100vh-56px)] max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
