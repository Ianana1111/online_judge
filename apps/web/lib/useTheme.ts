"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Tracks the site's effective theme (explicit [data-theme] stamp, falling back to system
 * preference), staying in sync across the ThemeToggle button and system-preference changes. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    function resolve() {
      const stamped = document.documentElement.getAttribute("data-theme");
      setTheme(stamped === "light" || stamped === "dark" ? stamped : systemTheme());
    }
    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", resolve);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", resolve);
    };
  }, []);

  return theme;
}
