import { SHELL_HTML } from "./shell.generated";

// The C learning map (content/learn-c). This route returns only the page shell — the chapters,
// practice problems and class solutions come from GET /learn/c/content on the API, which serves
// them to tutored students only. The shell's scripts and styles are static files in
// public/learn/c/. It is a route rather than a public/ file so the API origin follows
// NEXT_PUBLIC_API_URL like the rest of the app (production, previews, local and E2E all differ).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/["<>&]/g, "");

export const dynamic = "force-static";

export function GET() {
  return new Response(SHELL_HTML.replace("__API__", API_URL), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
