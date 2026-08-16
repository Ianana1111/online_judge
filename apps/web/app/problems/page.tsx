import type { Metadata } from "next";
import ProblemsBrowser from "@/components/ProblemsBrowser";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Problems",
  description: "430+ curated UVa/CPE problems, filterable by difficulty, tag, and past-exam appearances.",
  alternates: { canonical: `${SITE_URL}/problems` },
};

export default function ProblemsPage() {
  return <ProblemsBrowser />;
}
