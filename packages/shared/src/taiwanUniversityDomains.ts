import type { TaiwanUniversity } from "./taiwanUniversities.js";

/**
 * The official student/staff email domain for each school in TAIWAN_UNIVERSITIES, used to gate
 * school-email verification: a user claiming "國立臺灣大學" must verify an address ending in
 * "@ntu.edu.tw" (or a subdomain of it, e.g. "@csie.ntu.edu.tw"), not just any ".edu.tw" address,
 * so the leaderboard's school grouping can't be gamed by picking a prestigious school and
 * verifying with an unrelated institution's mailbox.
 *
 * Compiled from each school's own domain-registration/webmail pages (several through Google/web
 * search rather than assumption, since guessed abbreviations are wrong often enough to matter —
 * e.g. 長榮大學 is cjcu.edu.tw not cju.edu.tw, 實踐大學 is usc.edu.tw not scc/usc-lookalikes,
 * 開南大學 is knu.edu.tw while崑山科技大學 is the one that actually holds ksu.edu.tw). "其他"
 * has no fixed institution and therefore no domain — deliberately excluded from this map's keys
 * (TypeScript enforces every other school has an entry), and the verification flow below should
 * simply not offer email verification when "其他" is selected. Some individual departments run
 * their own subdomains (e.g. "cc.ntu.edu.tw") — the suffix check in verifySchoolEmailDomain
 * handles that by matching "ends with the domain," not just "domain is everything after @".
 */
export const TAIWAN_UNIVERSITY_DOMAINS: Record<Exclude<TaiwanUniversity, "其他">, string> = {
  // National — comprehensive / research
  "國立臺灣大學": "ntu.edu.tw",
  "國立清華大學": "nthu.edu.tw",
  "國立陽明交通大學": "nycu.edu.tw",
  "國立成功大學": "ncku.edu.tw",
  "國立政治大學": "nccu.edu.tw",
  "國立中央大學": "ncu.edu.tw",
  "國立中山大學": "nsysu.edu.tw",
  "國立中興大學": "nchu.edu.tw",
  "國立臺灣師範大學": "ntnu.edu.tw",
  "國立臺灣科技大學": "ntust.edu.tw",
  "國立臺北科技大學": "ntut.edu.tw",
  "國立臺北大學": "ntpu.edu.tw",
  "國立中正大學": "ccu.edu.tw",
  "國立彰化師範大學": "ncue.edu.tw",
  "國立高雄師範大學": "nknu.edu.tw",
  "國立東華大學": "ndhu.edu.tw",
  "國立暨南國際大學": "ncnu.edu.tw",
  "國立宜蘭大學": "niu.edu.tw",
  "國立聯合大學": "nuu.edu.tw",
  "國立高雄大學": "nuk.edu.tw",
  "國立屏東大學": "nptu.edu.tw",
  "國立嘉義大學": "ncyu.edu.tw",
  "國立臺南大學": "nutn.edu.tw",
  "國立臺北教育大學": "ntue.edu.tw",
  "國立臺東大學": "nttu.edu.tw",
  "國立金門大學": "nqu.edu.tw",
  "國立臺灣海洋大學": "ntou.edu.tw",
  "國防醫學院": "ndmctsgh.edu.tw",
  "國立中央警察大學": "cpu.edu.tw",
  "國立空中大學": "nou.edu.tw",

  // National — technical / vocational
  "國立雲林科技大學": "yuntech.edu.tw",
  "國立虎尾科技大學": "nfu.edu.tw",
  "國立高雄科技大學": "nkust.edu.tw",
  "國立臺中科技大學": "nutc.edu.tw",
  "國立勤益科技大學": "ncut.edu.tw",
  "國立屏東科技大學": "npust.edu.tw",
  "國立臺北商業大學": "ntub.edu.tw",
  "國立澎湖科技大學": "npu.edu.tw",
  "國立高雄餐旅大學": "nkuht.edu.tw",

  // National — arts / sports
  "國立臺北藝術大學": "tnua.edu.tw",
  "國立臺灣藝術大學": "ntua.edu.tw",
  "國立臺南藝術大學": "tnnua.edu.tw",
  "國立體育大學": "ntsu.edu.tw",
  "國立臺灣體育運動大學": "ntus.edu.tw",

  // Private — comprehensive
  "輔仁大學": "fju.edu.tw",
  "東吳大學": "scu.edu.tw",
  "淡江大學": "tku.edu.tw",
  "中原大學": "cycu.edu.tw",
  "逢甲大學": "fcu.edu.tw",
  "東海大學": "thu.edu.tw",
  "靜宜大學": "pu.edu.tw",
  "銘傳大學": "mcu.edu.tw",
  "中國文化大學": "pccu.edu.tw",
  "世新大學": "shu.edu.tw",
  "實踐大學": "usc.edu.tw",
  "長庚大學": "cgu.edu.tw",
  "元智大學": "yzu.edu.tw",
  "義守大學": "isu.edu.tw",
  "中華大學": "chu.edu.tw",
  "玄奘大學": "hcu.edu.tw",
  "佛光大學": "fgu.edu.tw",
  "南華大學": "nhu.edu.tw",
  "開南大學": "knu.edu.tw",
  "華梵大學": "hfu.edu.tw",
  "長榮大學": "cjcu.edu.tw",
  "康寧大學": "ukn.edu.tw",
  "亞洲大學": "asia.edu.tw",
  "大葉大學": "dyu.edu.tw",
  "明道大學": "mdu.edu.tw",

  // Private — medical
  "台北醫學大學": "tmu.edu.tw",
  "高雄醫學大學": "kmu.edu.tw",
  "中山醫學大學": "csmu.edu.tw",
  "中國醫藥大學": "cmu.edu.tw",
  "慈濟大學": "tcu.edu.tw",
  "元培醫事科技大學": "ypu.edu.tw",

  // Private — technical / vocational
  "朝陽科技大學": "cyut.edu.tw",
  "南台科技大學": "stust.edu.tw",
  "崑山科技大學": "ksu.edu.tw",
  "龍華科技大學": "lhu.edu.tw",
  "明志科技大學": "mcut.edu.tw",
  "文藻外語大學": "wzu.edu.tw",
  "中臺科技大學": "ctust.edu.tw",
  "弘光科技大學": "hk.edu.tw",
  "嶺東科技大學": "ltu.edu.tw",
  "僑光科技大學": "ocu.edu.tw",
  "台南應用科技大學": "tut.edu.tw",
  "德明財經科技大學": "takming.edu.tw",
  "致理科技大學": "chihlee.edu.tw",
  "醒吾科技大學": "hwu.edu.tw",
  "中國科技大學": "cute.edu.tw",
  "東南科技大學": "tnu.edu.tw",
  "中州科技大學": "ccut.edu.tw",
  "修平科技大學": "hust.edu.tw",
  "遠東科技大學": "feu.edu.tw",
  "建國科技大學": "ctu.edu.tw",
  "樹德科技大學": "stu.edu.tw",
  "正修科技大學": "csu.edu.tw",
  "高苑科技大學": "kyu.edu.tw",
  "環球科技大學": "twu.edu.tw",
};

/** Leaderboard `school` filter sentinel: "group everyone who hasn't verified a school claim" —
 * both users with no school at all and users who picked one but never confirmed the email link.
 * An unverified claim doesn't get to appear as its own group (see the domain check above for why
 * that would be gameable), so it falls in here on the leaderboard instead of just vanishing. */
export const UNVERIFIED_SCHOOL_FILTER = "__unverified__";

/** True if `email` belongs to `school`'s registered domain (exact match or any subdomain of it). */
export function verifySchoolEmailDomain(email: string, school: string): boolean {
  const domain = (TAIWAN_UNIVERSITY_DOMAINS as Record<string, string | undefined>)[school];
  if (!domain) return false;
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) return false;
  return emailDomain === domain || emailDomain.endsWith(`.${domain}`);
}
