import { batch1Dictionary } from "./dict/batch1";
import { batch2Dictionary } from "./dict/batch2";
import { batch3Dictionary } from "./dict/batch3";
import { batch4Dictionary } from "./dict/batch4";

/**
 * A handful of English strings turned out to be used in more than one place with genuinely
 * different intended meanings (e.g. "Contests" as a nav label vs. an admin section, "Free" as
 * the plan *name* vs. a generic adjective) — these override whichever batch shard's guess would
 * otherwise win, so the same English key resolves to one consistent, context-correct translation
 * everywhere. Two other collisions ("Register" for an account vs. for a contest, "Solved" as a
 * status badge vs. a scoreboard column) were genuinely different enough to need distinct source
 * strings instead — see ContestDetailClient.tsx's "Register for contest" and Scoreboard.tsx's
 * "Solved count".
 */
const overrides: Record<string, string> = {
  "Submission": "送出紀錄",
  "My Submissions": "提交歷史",
  "No submissions yet.": "還沒有送出紀錄。",
  // Verdict/judging status stays in English everywhere (AC/WA/TLE/... is the universal CP
  // convention, in Chinese conversation too) — these two are the only VERDICT_LABEL values that
  // were still spelled-out English words rather than already-bare codes, so they're the only
  // ones a batch shard had a Chinese translation for. Setting the value equal to the key forces
  // the English passthrough even in zh-TW mode instead of deleting the (now dead) shard entries.
  "Pending": "Pending",
  "Judging": "Judging",
  "Contests": "比賽",
  "Handle": "帳號名稱",
  "Collections": "題目集",
  "Discussion": "討論",
  "My Classes": "我的課程",
  "Activity": "動態",
  "Not started": "尚未開始",
  "Title": "標題",
  "Free": "Free",
  "until {date}": "至 {date}",
  "Due {date}": "截止於 {date}",

  // --- disambiguated from a collision during the dictionary merge (see comment above) ---
  "Register for contest": "報名",
  "Solved count": "解出題數",
  "About this site": "關於本站",
  "error": "錯誤",

  // --- HomeDashboard.tsx sidebar redesign ---
  "This week's top solvers": "本週解題王",
  "full board →": "完整排行榜 →",
  "Nobody's solved anything this week yet — be the first.": "這週還沒有人解題，當第一個吧。",

  // --- School profile + leaderboard redesign ---
  "Select your school": "選擇你的學校",
  "Search…": "搜尋…",
  "Clear": "清除",
  "No matches": "沒有符合的結果",
  "School": "學校",
  "Shown on your public profile and the leaderboard.": "會顯示在你的公開個人頁面和排行榜上。",
  "Could not update school": "無法更新學校",
  "Welcome! Quick setup": "歡迎！快速設定一下",
  "Add your school so classmates can find each other on the leaderboard — takes a few seconds, and you can always change this later in Settings.":
    "填一下你的學校，讓同校的人可以在排行榜上找到彼此——只要幾秒鐘，之後也可以隨時到設定裡修改。",
  "Nickname": "暱稱",
  "Skip for now": "先跳過",
  "Could not save your profile": "無法儲存你的個人資料",
  "Rank": "名次",
  "User": "使用者",
  "Avg time": "平均時間",
  "Avg memory": "平均記憶體",
  "Total submissions": "總提交次數",
  "Top at {school}:": "{school} 目前最強的是：",
  "All schools": "所有學校",
  "Nobody from {school} has solved anything yet — be the first.": "{school} 還沒有人解過題，當第一個吧。",

  // --- Leaderboard: score removed in favor of ranking by raw solved count ---
  "Most solved": "解出最多",
  "Ranked by how many problems you've solved — grinding a lot beats grinding hard.":
    "依解出題數排名——解得多比解得難更重要。",
};

/**
 * Traditional Chinese translations, keyed by the literal English string used at each `t()`
 * call site. English mode needs no dictionary at all (the key IS the English text) — this file
 * only ever grows in one direction, and a missing key just falls back to English instead of
 * showing a broken-looking raw key (see useT in LocaleContext.tsx).
 *
 * "{name}"-style placeholders in a key must appear in its translation too, e.g. "Wait {n}s".
 */
export const dictionary: Record<string, string> = {
  // --- app/settings/page.tsx ---
  "Image is too large even after compression — try a smaller or simpler picture.":
    "圖片壓縮後還是太大，換一張小一點或簡單一點的圖片試試。",
  "Could not upload avatar": "無法上傳頭像",
  "Could not remove avatar": "無法移除頭像",
  "Could not save motto": "無法儲存個人簽名",
  "Profile": "個人資料",
  "Avatar": "頭像",
  "Uploading…": "上傳中…",
  "Change photo": "更換照片",
  "Remove photo": "移除照片",
  "Motto": "個人簽名",
  "A line about yourself, shown on your public profile": "一句關於你自己的話，會顯示在公開個人頁面",
  "Saving…": "儲存中…",
  "Saved ✓": "已儲存 ✓",
  "Save": "儲存",
  "Could not change name": "無法變更名稱",
  "Change display name": "變更顯示名稱",
  "Letters, numbers, and underscore only": "只能使用英文字母、數字和底線",
  "Letters, numbers, and underscore only. This is also what you use to log in if you have a password set.":
    "只能使用英文字母、數字和底線。如果你有設定密碼，這也是登入時使用的帳號。",
  "Name changed ✓": "名稱已變更 ✓",
  "Save name": "儲存名稱",
  "New password and confirmation don't match": "新密碼與確認密碼不一致",
  "Could not change password": "無法變更密碼",
  "Change password": "變更密碼",
  "Current password": "目前密碼",
  "New password": "新密碼",
  "Confirm new password": "確認新密碼",
  "Password changed ✓": "密碼已變更 ✓",
  "Display language": "介面語言",
  "Preferences": "偏好設定",
  "Default language": "預設程式語言",
  "Daily goal": "每日目標",
  "Problems to solve per day to keep your streak on track.": "每天要解出幾題才能維持連續紀錄。",
  "Light/dark theme is in the top-right corner of the page, next to your account menu.":
    "淺色／深色主題切換在頁面右上角，就在帳號選單旁邊。",
  "Settings": "設定",
  "Account": "帳號",
  "Password": "密碼",

  // --- batch shards (home/problems/auth, judge/contests/collections, discussion/classes/upgrade, admin) ---
  ...batch1Dictionary,
  ...batch2Dictionary,
  ...batch3Dictionary,
  ...batch4Dictionary,

  // --- conflict resolutions (must stay last so they win) ---
  ...overrides,
};
