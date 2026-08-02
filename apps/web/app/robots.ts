import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account-gated or purely functional pages — nothing here is content worth indexing, and
      // some (checkout, admin) actively shouldn't be crawled. /upgrade itself (plan comparison)
      // renders for logged-out visitors too and is worth indexing — only its checkout step isn't.
      disallow: [
        "/settings",
        "/submissions",
        "/upgrade/checkout",
        "/classes",
        "/assignments",
        "/admin",
        "/login",
        "/register",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
