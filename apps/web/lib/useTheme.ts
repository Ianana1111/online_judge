"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Keep editors, charts and toggles in sync with the site's explicit theme. Default to dark. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    function resolve() {
      const stamped = document.documentElement.getAttribute("data-theme");
      setTheme(stamped === "light" ? "light" : "dark");
    }
    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  return theme;
}
