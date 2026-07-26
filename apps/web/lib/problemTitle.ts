// Scraped CPE/UVA titles are stored as "1660 - Cable TV Network" (the judge number baked
// straight into the string) — GPE titles never had a number prefix to begin with. Since the
// number is already shown separately (the "#" column on the problem list, and a badge next to
// the title on the problem detail page), stripping a leading "<uvaId> - " here avoids showing it
// twice. Display-only: the stored title is left untouched everywhere else (search, admin, page
// <title>, etc.) so this never has to stay in sync with a data migration.
//
// Anchored to the problem's OWN uvaId rather than a generic /^\d+\s*-\s*/ pattern on purpose: a
// handful of real UVa titles start with digits themselves (e.g. uvaId=10268's actual title is
// "498-bis") — matching a generic leading number would strip part of the real title instead of
// just the prefix. Requiring the leading digits to equal uvaId exactly makes that impossible.
export function stripProblemNumber(title: string, uvaId?: number | null): string {
  if (uvaId == null) return title;
  const match = title.match(/^(\d+)\s*-\s*/);
  if (!match || Number(match[1]) !== uvaId) return title;
  return title.slice(match[0].length);
}
