import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Noto_Sans_TC } from "next/font/google";
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

// Self-host the Traditional Chinese fallback; Apple devices use their native
// system/PingFang faces first via the scoped statement font stack.
const statement = Noto_Sans_TC({
  subsets: ["latin"],
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

// Apply a saved choice before paint. New visitors (including browsers that block storage)
// start dark, consistently with the CSS palette and useTheme's fallback.
const THEME_BOOTSTRAP_SCRIPT = `
  var t = "dark";
  try {
    if (localStorage.getItem("theme") === "light") t = "light";
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", t);
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by middleware.ts alongside the actual CSP response header — see that file's doc comment
  // for why the nonce can't just live in a static config.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="zh-TW" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable} ${statement.variable}`}>
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
