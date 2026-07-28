import { redirect } from "next/navigation";

// The CPE archive now lives inside the unified Contests hub — kept as a redirect (not a deleted
// route) since ExamModeShell/ContestDetailClient still point exam-mode's "exit" button here.
export default function CpePage() {
  redirect("/contests?tab=cpe");
}
