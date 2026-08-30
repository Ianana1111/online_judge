// i18n batch 2 — SubmissionPanel/TestPanel/submission history/stats, contests, collections.
// Merged into the main dictionary via apps/web/lib/i18n/dictionary.ts.
export const batch2Dictionary: Record<string, string> = {
  // --- components/SubmissionPanel.tsx ---
  "You're submitting too fast — wait a few seconds and try again.": "送出太快了，等幾秒鐘再試一次。",
  "Something went wrong submitting your code.": "送出程式碼時發生錯誤。",
  "Log in to write and submit code for this problem.": "登入後即可撰寫並送出這一題的程式碼。",
  "Log in": "登入",
  "This problem has no matching UVa judge, so it isn't gradeable here — reference-only. Use it for reading/practice; submitting is disabled.":
    "這一題沒有對應的 UVa 評測，無法在這裡評分，僅供閱讀參考，已關閉送出功能。",
  "Not gradeable": "無法評分",
  "Locked": "已鎖定",
  "Submitting…": "送出中…",
  "Pending…": "評測中…",
  "Wait {n}s": "等待 {n} 秒",
  "Submit": "送出",
  "You've used all {limit} free submissions —": "你已經用完 {limit} 次免費送出額度 —",
  "upgrade to Pro": "升級 Pro",
  "for unlimited.": "即可無限送出。",
  "{used}/{limit} free submissions used": "已使用 {used}/{limit} 次免費送出額度",
  "Verdict": "結果",
  // Language display names (LANGUAGE_LABEL values) are deliberately left untranslated — "C++17"
  // etc. read the same in both languages, so t() just falls back to the original text.

  // --- components/TestPanel.tsx ---
  "Compile error": "編譯錯誤",
  "Lost connection while running.": "執行時連線中斷。",
  "You're running tests too fast — wait a moment and try again.": "測試執行得太快了，稍等一下再試一次。",
  "Something went wrong running your code.": "執行程式碼時發生錯誤。",
  "Remove test case": "刪除測資",
  "Add your own test case": "新增自訂測資",
  "+ Add case": "+ 新增測資",
  "Running…": "執行中…",
  "▶ Run": "▶ 執行",
  "Input": "輸入",
  "Expected output": "預期輸出",
  "Output": "輸出",
  "Matches expected": "與預期相符",
  "Doesn't match": "與預期不符",
  "Timed out": "執行逾時",
  "(no output)": "（沒有輸出）",
  "No test cases yet — add one to try your code.": "還沒有測資，新增一筆來測試你的程式碼。",

  // --- components/SubmissionHistory.tsx ---
  "No submissions yet for this problem.": "這一題還沒有任何送出紀錄。",
  "When": "時間",
  "Language": "語言",
  "Time": "時間",
  "Memory": "記憶體",

  // --- components/SubmissionCodeModal.tsx ---
  "Submission": "送出紀錄",
  "Close": "關閉",
  "Could not load this submission.": "無法載入這筆送出紀錄。",
  "Compiler / judge message": "編譯器／評測訊息",
  "Source code": "原始碼",
  "Source code is only visible to the person who wrote it.": "原始碼只有本人才看得到。",

  // --- components/ProblemNotePanel.tsx ---
  "Log in to keep your own private notes on this problem.": "登入後即可為這一題撰寫專屬的私人筆記。",
  "Private — only you can see this.": "私人筆記，只有你看得到。",
  "Your approach, gotchas, things to remember next time…": "解題思路、踩過的坑、下次要記得的事……",
  "Saved ✓": "已儲存 ✓",
  "Save note": "儲存筆記",
  "Could not save your note": "無法儲存筆記",

  // --- components/ProblemStatsPanel.tsx ---
  "Nobody's solved this one yet — be the first, and these stats fill in.": "還沒有人解出這一題，成為第一個，這裡的統計就會開始累積。",
  "Your best:": "你的最佳成績：",
  "beats {pct}% of solvers": "贏過 {pct}% 的解題者",
  "Runtime — {n} solver": "執行時間 — {n} 位解題者",
  "Runtime — {n} solvers": "執行時間 — {n} 位解題者",
  "fastest": "最快",
  "median": "中位數",
  "slowest": "最慢",

  // --- components/DistributionChart.tsx ---
  "{n} solver": "{n} 位解題者",
  "{n} solvers": "{n} 位解題者",
  "you're here": "你在這裡",
  "Aggregate only — {unit} bucket counts, not anyone's actual code.": "僅顯示彙總的{unit}區間人數，不會顯示任何人的實際程式碼。",
  "runtime": "執行時間",
  "memory": "記憶體",

  // --- components/StatCharts.tsx ---
  "Language usage": "使用語言分布",
  "No accepted submissions yet.": "還沒有通過的送出紀錄。",
  "Verdict breakdown": "結果分布",
  "No submissions yet.": "還沒有送出紀錄。",
  "Solved by difficulty": "依難度解題數",
  "Pending": "等待中",
  "Judging": "評測中",
  "Accepted": "通過",
  "Wrong Answer": "答案錯誤",
  "Time Limit Exceeded": "超過時間限制",
  "Memory Limit Exceeded": "超過記憶體限制",
  "Runtime Error": "執行期錯誤",
  "Restricted Function": "使用受限函式",
  "Compile Error": "編譯錯誤",
  "Presentation Error": "格式錯誤",
  "Output Limit Exceeded": "超過輸出限制",
  "System Error": "系統錯誤",

  // --- app/contests/page.tsx ---
  "In progress": "進行中",
  "Finished": "已結束",
  "{n} min virtual exam": "{n} 分鐘虛擬考試",
  "Contests": "考試",
  "Every past CPE and GPE sitting, packaged as a timed virtual exam — start one whenever you're ready and it runs its own private countdown, exactly like the real thing.":
    "每一場歷屆 CPE、GPE 都變成一場計時虛擬考試——準備好隨時可以開始，會有專屬你的倒數計時，跟正式考試一模一樣。",
  "Log in to start a virtual exam and track your attempts here.": "登入後即可開始虛擬考試，並在這裡追蹤你的作答紀錄。",
  "Continue where you left off": "繼續上次的進度",
  "{solved} / {total} solved": "已解出 {solved} / {total}",
  "resume before it ends": "在時間結束前繼續作答",
  "Latest CPE sittings": "最新 CPE 歷屆",
  "{n} total": "共 {n} 場",
  "No CPE sittings loaded yet.": "還沒有載入 CPE 歷屆資料。",
  "Latest GPE sittings": "最新 GPE 歷屆",
  "No GPE sittings loaded yet.": "還沒有載入 GPE 歷屆資料。",
  "Full archive": "完整歷屆列表",
  "Nothing here yet.": "這裡還沒有資料。",

  // --- components/ContestDetailClient.tsx ---
  "Could not join the contest": "無法加入這場考試",
  "Loading contest…": "考試載入中…",
  "← Back to problem set": "← 回到題目列表",
  "Problems": "題目",
  "Scoreboard": "排行榜",
  "← All contests": "← 所有考試",
  "{n} min": "{n} 分鐘",
  "penalty {n}m/wrong": "每次答錯罰 {n} 分鐘",
  "This is a scheduled group session — everyone who registers shares one clock, starting at":
    "這是預先排定的團體場次——所有報名的人共用同一個時鐘，開始時間為",
  "and ending {n} minutes later, whether you register early or join right at the start.":
    "並在 {n} 分鐘後結束，無論你是提早報名還是準時開始都一樣。",
  "Starting begins your personal {n}-minute window right now — the clock does not stop if you leave.":
    "按下開始就會啟動你專屬的 {n} 分鐘倒數計時——中途離開也不會暫停。",
  "Joining…": "加入中…",
  "Register": "報名",
  "Start exam": "開始考試",
  "You're registered. This contest hasn't started yet.": "你已經報名了，這場考試還沒開始。",
  "Starts at {when}": "開始時間：{when}",
  "This page refreshes automatically — come back here once the start time arrives.":
    "這個頁面會自動更新——開始時間到了再回來看看。",

  // --- components/Scoreboard.tsx ---
  "Loading scoreboard…": "排行榜載入中…",
  "No submissions yet — the board fills in as people solve problems.": "還沒有送出紀錄——隨著大家解題，排行榜會逐漸更新。",
  "Scoreboard frozen — standings for the last stretch are hidden until the contest ends.":
    "排行榜已凍結——最後一段時間的名次會在考試結束後才公布。",
  "Handle": "帳號名稱",
  "Solved": "解出題數",
  "Penalty": "罰時",

  // --- components/ExamModeShell.tsx ---
  "Time's up": "時間到",
  "Your exam window has ended. Submissions are locked —": "考試時間已結束，已無法再送出——",
  "view the final scoreboard": "查看最終排行榜",

  // --- components/CollectionsListClient.tsx ---
  "{n} problems": "{n} 題",
  "Collections": "題目集",
  "Curated problem sets to work through at your own pace.": "精選題組，讓你按自己的步調練習。",
  "{n} collections": "{n} 個題目集",
  "No collections yet.": "還沒有任何題目集。",

  // --- components/CollectionDetailClient.tsx ---
  "Collection not found.": "找不到這個題目集。",
  "Progress": "進度",
  // "{solved} / {total} solved" already defined above (ContestDetailClient.tsx uses the same string).
};
