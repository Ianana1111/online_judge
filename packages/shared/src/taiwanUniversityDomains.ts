import { SCHOOL_CATALOG, SCHOOL_NAME_ALIASES } from "./taiwanSchoolCatalog.js";

export const UNVERIFIED_SCHOOL_FILTER = "__unverified__";
export function canonicalSchoolName(school: string): string {
  return Object.prototype.hasOwnProperty.call(SCHOOL_NAME_ALIASES, school) ? SCHOOL_NAME_ALIASES[school] : school;
}
export function getSchoolEmailDomains(school: string): readonly string[] {
  return SCHOOL_CATALOG.find((s) => s.name === canonicalSchoolName(school))?.emailRoots ?? [];
}
/** Compatibility display map. Verification must use getSchoolEmailDomains, which supports
 * independently evidenced alternate domains after mergers/renaming. */
export const TAIWAN_UNIVERSITY_DOMAINS: Readonly<Record<string, string | undefined>> = Object.fromEntries(
  SCHOOL_CATALOG.filter((s) => s.emailRoots.length).map((s) => [s.name, s.emailRoots[0]]),
);
export function verifySchoolEmailDomain(email: string, school: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || parts[0].length > 64 || email.length > 254 || /\s|[<>]/.test(parts[0])) return false;
  const domain = parts[1];
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) return false;
  return getSchoolEmailDomains(school).some((root) => domain === root || domain.endsWith(`.${root}`));
}
