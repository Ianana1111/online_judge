import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// contests/page.tsx is a client component (needs useAuthStore/useSearchParams for the
// logged-in/tab-filter UI), so metadata can't be exported from it directly — a layout.tsx at the
// same segment is the standard way to attach static metadata to a client page.
export const metadata: Metadata = {
  title: "Contests",
  description: "Timed CPE/GPE virtual exams — recreate any past sitting under real exam conditions, on your own schedule.",
  alternates: { canonical: `${SITE_URL}/contests` },
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
