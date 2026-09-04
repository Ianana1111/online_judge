import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
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

const DEFAULT_TITLE = "judge. — online judge for CPE & UVa practice";
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
    <html lang="zh-TW" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ORGANIZATION_JSON_LD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(WEBSITE_JSON_LD) }} />
      </head>
      <body>
        <Providers>
          <PageviewTracker />
          <PromoBanner />
          <ActiveExamBanner />
          <NavBar />
          <ProfileSetupGate />
          <PendingDeletionGate />
          <main className="mx-auto min-h-[calc(100vh-56px)] max-w-[1400px] px-6 py-6">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
