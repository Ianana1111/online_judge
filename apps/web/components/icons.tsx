import type { ReactNode } from "react";

/** Every icon here follows the same thin-stroke, monochrome (currentColor) style as LockIcon and
 * InfoTooltip's "?" badge — line-art instead of colorful emoji, so accent color/size are driven by
 * the caller's className rather than baked into the glyph. */
function makeIcon(paths: ReactNode) {
  return function IconComponent({ className = "h-4 w-4" }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {paths}
      </svg>
    );
  };
}

export const FlameIcon = makeIcon(
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
);

export const TrophyIcon = makeIcon(
  <>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 4h3a2 2 0 0 1 2 2 5 5 0 0 1-5 5" />
    <path d="M7 4H4a2 2 0 0 0-2 2 5 5 0 0 0 5 5" />
  </>,
);

export const RocketIcon = makeIcon(
  <>
    <path d="M12 2c2 2 3 5 3 8 0 1.5-.3 3-1 4.3L12 22l-2-7.7C9.3 13 9 11.5 9 10c0-3 1-6 3-8Z" />
    <circle cx="12" cy="9" r="1.5" />
    <path d="M7 15c-1.5 1-2 3-2 5 2 0 4-.5 5-2" />
    <path d="M17 15c1.5 1 2 3 2 5-2 0-4-.5-5-2" />
  </>,
);

export const FlagIcon = makeIcon(
  <>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="3" />
  </>,
);

export const LayersIcon = makeIcon(
  <>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </>,
);

export const BookOpenIcon = makeIcon(
  <>
    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </>,
);

export const LeafIcon = makeIcon(
  <>
    <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-10 1 3 3 5 5 6 2 1.5 3 4 3 6a7 7 0 0 1-10 5Z" />
    <path d="M5 21c4-3 6-6 8-11" />
  </>,
);

export const TreeIcon = makeIcon(
  <>
    <path d="M12 2 8 8h2l-4 6h3l-4 6h14l-4-6h3l-4-6h2z" />
    <line x1="12" y1="22" x2="12" y2="20" />
  </>,
);

export const GemIcon = makeIcon(
  <>
    <path d="M6 3h12l4 6-10 12L2 9Z" />
    <path d="M11 3 8 9l4 12 4-12-3-6" />
    <path d="M2 9h20" />
  </>,
);

export const ZapIcon = makeIcon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />);

export const FileTextIcon = makeIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </>,
);

export const MedalIcon = makeIcon(
  <>
    <circle cx="12" cy="8" r="6" />
    <polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88" />
  </>,
);

export const SunIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
);

export const MoonIcon = makeIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />);

export const CloudSunIcon = makeIcon(
  <>
    <path d="M12 2v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M20 12h2" />
    <path d="M2 12h2" />
    <circle cx="12" cy="9" r="3" />
    <path d="M17 20a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A4 4 0 0 0 7 20z" />
  </>,
);

export const SunsetIcon = makeIcon(
  <>
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="12" y1="9" x2="12" y2="2" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <polyline points="8 6 12 2 16 6" />
    <line x1="2" y1="22" x2="22" y2="22" />
  </>,
);

export const SparklesIcon = makeIcon(
  <>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 3v3M3.5 4.5h3" />
    <path d="M19 17v3M17.5 18.5h3" />
  </>,
);

export const ArchiveIcon = makeIcon(
  <>
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </>,
);

/** Daily check-in streak — a calendar with a check, distinct from the flame (solve streak) so the
 * two "streak" concepts never look like the same metric at a glance. */
export const CalendarCheckIcon = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 16l2 2 4-4" />
  </>,
);

/** Streak-freeze — a snowflake, so "protect today's streak" reads as a distinct cool-toned action
 * from the flame's warm "keep it burning" one. */
export const SnowflakeIcon = makeIcon(
  <>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    <path d="M12 2l-2 2m2-2l2 2M12 22l-2-2m2 2l2-2M2 12l2-2m-2 2l2 2M22 12l-2-2m2 2l-2 2" />
  </>,
);

export const XIcon = makeIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const ChevronRightIcon = makeIcon(<polyline points="9 18 15 12 9 6" />);

/** School affiliation — only ever shown next to a *verified* school claim. */
export const GraduationCapIcon = makeIcon(
  <>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
  </>,
);

/** Per-achievement-code icon, shared by HomeDashboard's trophy case and the public profile page so
 * both surfaces agree on what each achievement looks like instead of one falling back to a generic
 * trophy for everything. */
export const ACHIEVEMENT_ICONS: Record<string, ReturnType<typeof makeIcon>> = {
  first_ac: FlagIcon,
  solved_10: LeafIcon,
  solved_50: LeafIcon,
  solved_100: TreeIcon,
  first_4star: GemIcon,
  streak_7: FlameIcon,
  streak_30: ZapIcon,
  collection_cleared: TrophyIcon,
  first_virtual_exam: FileTextIcon,
};
