export interface AchievementDef {
  code: string;
  title: string;
  description: string;
}

// A fixed list defined in code rather than a DB table — the set changes rarely and doesn't need
// admin editing, so a migration is an acceptable cost for adding a new one later.
export const ACHIEVEMENTS: AchievementDef[] = [
  { code: "first_ac", title: "First Blood", description: "Solved your first problem." },
  { code: "solved_10", title: "Getting Started", description: "Solved 10 problems." },
  { code: "solved_50", title: "Half Century", description: "Solved 50 problems." },
  { code: "solved_100", title: "Centurion", description: "Solved 100 problems." },
  { code: "first_4star", title: "Into the Deep End", description: "Solved a ★★★★ problem." },
  { code: "streak_7", title: "Week Streak", description: "Solved something 7 days in a row." },
  { code: "streak_30", title: "Month Streak", description: "Solved something 30 days in a row." },
  { code: "collection_cleared", title: "Set Complete", description: "Solved every problem in a curated collection." },
  { code: "first_virtual_exam", title: "Exam Ready", description: "Started your first virtual exam." },
];

export const ACHIEVEMENT_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a]));
