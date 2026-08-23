// i18n batch 1 — home, problems list/detail, auth, nav, notifications, onboarding, error pages.
// Merged into the main dictionary via apps/web/lib/i18n/dictionary.ts.
export const batch1Dictionary: Record<string, string> = {
  // --- app/login/page.tsx ---
  "Google sign-in didn't work — try again, or use your handle and password.":
    "Google 登入沒有成功，請再試一次，或是改用帳號密碼登入。",
  "Log in failed": "登入失敗",
  "Log in": "登入",
  "Handle": "帳號",
  "Password": "密碼",
  "Logging in…": "登入中…",
  "or": "或",
  "No account yet?": "還沒有帳號？",
  "Register": "註冊",

  // --- app/register/page.tsx ---
  "Could not create account": "無法建立帳號",
  "Create an account": "建立帳號",
  "Email": "電子信箱",
  "Creating account…": "建立中…",
  "Create account": "建立帳號",
  "Already have an account?": "已經有帳號了？",

  // --- app/error.tsx ---
  "Something went wrong": "發生了一些問題",
  "This page hit an unexpected error. It's been logged — try again, or head back to the homepage.":
    "這個頁面發生非預期的錯誤，我們已經記錄下來了——可以再試一次，或是回首頁。",
  "Try again": "再試一次",
  "Some data on this page failed to load — try refreshing.": "這個頁面有部分資料載入失敗——請重新整理。",

  // --- app/not-found.tsx ---
  "This page doesn't exist": "這個頁面不存在",
  "The problem, contest, or page you're looking for isn't here — it may have been moved or never existed.":
    "你要找的題目、比賽或頁面不在這裡——可能已經被移除，或者根本沒存在過。",
  "Go home": "回首頁",
  "Browse problems": "瀏覽題目",

  // --- components/HomeDashboard.tsx ---
  "Still up": "還沒睡",
  "Good morning": "早安",
  "Good afternoon": "午安",
  "Good evening": "晚安",
  "just now": "剛剛",
  "{n}m ago": "{n} 分鐘前",
  "{n}h ago": "{n} 小時前",
  "{n}d ago": "{n} 天前",
  "Couldn't use a freeze — try again.": "無法使用凍結，再試一次。",
  "Life gets busy — spend one to keep your streak alive today without solving anything.":
    "生活忙起來難免的——用掉一次凍結，今天不用解題也能保住連續紀錄。",
  "Using…": "使用中…",
  "Use a freeze ({n} left)": "使用凍結（剩 {n} 次）",
  "Today's problem": "今日一題",
  "Solved": "已解出",
  "Solve it →": "去解題 →",
  "{date}: {count} submissions": "{date}：{count} 次提交",
  "no streak yet": "尚無連續紀錄",
  "protected today": "今日已保護",
  "at risk today": "今日岌岌可危",
  "day streak": "天連續",
  "Next in {collection}": "「{collection}」的下一題",
  "Build your tier": "鞏固你的等級",
  "Stretch — one tier up": "挑戰高一級",
  "Latest: {title}": "最新成就：{title}",
  "Ready to pick up where you left off?": "準備好接續上次的進度了嗎？",
  "{n} days in a row you've shown up": "連續 {n} 天都有上線",
  " — bonus streak-freeze earned!": "——獲得額外的連續紀錄凍結！",
  "Continue solving": "繼續解題",
  "current tier": "目前等級",
  "solved": "已解出",
  "rank this week": "本週排名",
  "achievements": "成就",
  "Recent activity": "最近動態",
  "view all →": "查看全部 →",
  "last 10 weeks": "最近 10 週",
  "Submission": "提交紀錄",
  "No submissions yet — solve something to light up your heatmap.": "還沒有提交紀錄——解一題來點亮你的熱力圖吧。",
  "Recommended for you": "為你推薦",
  "browse all →": "瀏覽全部 →",
  "No new recommendations yet —": "目前沒有新的推薦——",
  "browse the problem list": "去題目列表逛逛",
  "to get started.": "開始練習吧。",
  "Trophy case": "獎盃陳列室",
  "view profile →": "查看個人頁面 →",
  "{title} — {description} ({date})": "{title} — {description}（{date}）",

  // --- components/LoggedOutHome.tsx ---
  "Practice UVa.": "刷 UVa 題庫。",
  "Sit CPE for real.": "真實模擬 CPE 應考。",
  "A judge built around the 3-hour, 7-problem CPE format — solve at your own pace, or start a timed virtual exam with a real scoreboard and ICPC-style penalties.":
    "專為 3 小時、7 題的 CPE 考試格式打造的評測系統——可以照自己的步調練習，也能開一場限時模擬考，附帶即時排行榜與 ICPC 式罰時。",
  "Start a CPE exam": "開始一場 CPE 模擬考",
  "Recent problems": "近期題目",
  "View all →": "查看全部 →",
  "No problems yet — check back soon.": "目前還沒有題目，稍後再來看看。",

  // --- components/OnboardingChecklist.tsx ---
  "Solve your first problem": "解出你的第一題",
  "Pick anything from the problem list and land an AC.": "從題目列表隨便挑一題，拿下一個 AC。",
  "Take a virtual CPE exam": "參加一場虛擬 CPE 模擬考",
  "Run a timed sitting under real exam conditions.": "在接近真實考場的限時環境下應考一次。",
  "Set your daily goal": "設定你的每日目標",
  "Decide how many problems a day keeps your streak alive.": "決定每天要解幾題才能維持連續紀錄。",
  "Getting started": "新手上路",
  "{done} of {total} done": "已完成 {done} / {total}",
  "Skip": "略過",

  // --- components/DailyGoalRing.tsx ---
  "/ {goal} today": "／ 今日目標 {goal}",

  // --- components/Heatmap.tsx ---
  "Less": "較少",
  "More": "較多",

  // --- components/NavBar.tsx ---
  "Admin": "管理員",
  "Pro Plan": "Pro 方案",
  "Free Plan": "免費方案",
  "Activity": "動態",
  "Settings": "設定",
  "Log out": "登出",
  "Problems": "題目",
  "Collections": "題庫集",
  "Contests": "比賽",
  "Leaderboard": "排行榜",
  "Discussion": "討論區",
  "FAQ": "常見問題",
  "About": "關於",
  "My Submissions": "我的提交紀錄",
  "My Classes": "我的班級",
  "Upgrade Plan": "升級方案",
  "Console": "後台",

  // --- components/NotificationBell.tsx ---
  "Notifications": "通知",
  "No notifications yet.": "目前沒有通知。",

  // --- components/GoogleLoginButton.tsx ---
  "Continue with Google": "使用 Google 繼續",

  // --- components/ProblemFilterTable.tsx / components/ProblemView.tsx (shared DIFFICULTY_EXPLANATION) ---
  "Curated ratings come first: problems from an officially-rated set (like the CPE 必考49題 one-star selection) keep that rating. Everything else is derived from how many people worldwide have solved it on UVa (more solvers = more introductory), with a minimum floor based on the algorithm topic — a DP or graph problem never rates below what its technique demands.":
    "有官方評級的題目優先採用該評級（例如 CPE 必考49題 的一星選題）。其餘題目則依據全世界在 UVa 上解出的人數估算（解出人數越多代表越入門），並依演算法主題設下難度下限——DP 或圖論題不會因為解題人數多就被評得比技術要求還低。",
  "Pro perk: sort by whether you've solved a problem yet, to hunt down what's left.":
    "Pro 專屬：依照是否解過排序，方便找出還沒解的題目。",
  "Pro perk: how many past CPE sittings this problem has appeared in.": "Pro 專屬：這題在歷屆 CPE 中出現過幾次。",
  "All difficulties": "所有難度",
  "All tags": "所有標籤",
  "Sort by solved": "依是否解過排序",
  "Search title…": "搜尋題目名稱…",
  "Clear filters": "清除篩選",
  "{visible} of {total} shown": "顯示 {visible} / {total} 題",
  "Title": "題目",
  "Source": "來源",
  "Difficulty": "難度",
  "Tags": "標籤",
  "Sort by past CPE appearances": "依歷屆 CPE 出現次數排序",
  "Past CPE": "歷屆 CPE",
  "Filter by {tag}": "篩選標籤：{tag}",
  "Pro feature — upgrade to see how many past CPE exams this problem appeared in":
    "Pro 專屬功能——升級後可查看這題在歷屆 CPE 出現過幾次",
  "No problems match these filters.": "沒有符合篩選條件的題目。",

  // --- components/ProblemPrevNext.tsx ---
  "collection": "題庫集",
  "← Start of list": "← 已到列表開頭",
  "{n} / {total} · {context}": "{n} / {total} · {context}",
  "End of list →": "已到列表結尾 →",

  // --- components/ProblemView.tsx ---
  "Statement": "題目敘述",
  "My submissions": "我的提交紀錄",
  "Stats": "統計",
  "Notes": "筆記",
  "Time limit: {ms} ms": "時間限制：{ms} 毫秒",
  "Memory limit: {mb} MB": "記憶體限制：{mb} MB",
  "Input": "輸入",
  "Output": "輸出",
  "Sample input {n}": "範例輸入 {n}",
  "Sample output {n}": "範例輸出 {n}",
  "Appeared in": "曾出現在",
  "past CPE exams.": "場歷屆 CPE 中。",
  "Hasn't appeared in a past CPE exam yet.": "尚未出現在任何一場歷屆 CPE 中。",
  "Pro feature:": "Pro 專屬功能：",
  "see how many times this problem has appeared in past CPE exams —": "查看這題在歷屆 CPE 出現過幾次 —",
  "upgrade to unlock": "升級以解鎖",

  // --- components/BackButton.tsx ---
  "Go back": "返回",
  "Back": "返回",
};
