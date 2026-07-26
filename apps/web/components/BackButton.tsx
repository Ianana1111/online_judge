"use client";

import { useRouter } from "next/navigation";

/** Top-left "go back" affordance for full-screen pages that intentionally have no NavBar (see
 * NavBar's /upgrade early-return) — those pages need their own way back since the site logo/nav
 * links aren't available. Falls back to `fallbackHref` when there's no in-app history to pop
 * (e.g. the user landed here directly from an external link), so it never leaves the visitor
 * stranded on a dead end. */
export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function handleClick() {
    // window.history.length > 1 is a heuristic, not a guarantee (a fresh tab that navigated here
    // via one client-side push already has length 2) — good enough to distinguish "arrived from
    // elsewhere in the app" from "opened this URL directly," which is all we need here.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors hover:text-ink-50"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
