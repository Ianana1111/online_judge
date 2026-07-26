"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The pricing page was redesigned and moved to /upgrade — kept as a redirect so any existing
// bookmarks or external links to /pricing still land somewhere useful instead of 404ing.
export default function PricingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/upgrade");
  }, [router]);

  return null;
}
