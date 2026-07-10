export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">關於我</h1>
        <p className="mt-2 text-sm text-ink-400">
          台大資工系學生，現於中研院從事研究工作，帶學生準備 APCS 與 CPE 檢定、打好程式基礎。
        </p>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">為什麼會有這個網站</h2>
        <p className="text-sm leading-relaxed text-ink-300">
          市面上不缺刷題平台——LeetCode、Codeforces、各種國際競程網站琳瑯滿目，但這些都不是為台灣的資工學生量身打造的：題型、考試制度、升學管道都跟我們真正要面對的 CPE（大學程式能力檢定）對不上。
          我自己也是一路準備這些檢定過來的學生，很清楚那種找不到「剛好符合台灣體制」練習資源的困擾。所以我決定自己動手做一個——把歷屆 CPE 考古題整理進來、串接真正的線上判題系統，
          讓每個學生都能在同一個地方，用最貼近實際考試的方式練習、追蹤自己的進度。這不只是我自己教學用的工具，更希望能實際幫助到每一個準備 CPE 的台灣資工人。
        </p>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">學歷</h2>
        <ul className="space-y-1.5 text-sm text-ink-300">
          <li>國立台灣大學 電機資訊學院資料科學碩士學位學程（準碩一）</li>
          <li>國立台灣大學 資訊工程學系（大四）</li>
          <li>國立台灣師範大學附屬高級中學 畢業</li>
        </ul>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">經歷</h2>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">學科成績</p>
          <ul className="space-y-1 text-sm text-ink-300">
            <li>微積分 A+（大一上、下）</li>
            <li>系排名第 1，獲頒書卷獎（大一上）</li>
            <li>APCS：觀念 5 級分、實作 3 級分</li>
            <li>GPE（Graduate Programming Examination）580 / 600（交大資工畢業門檻為 240 / 600）</li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">研究與專案</p>
          <ul className="space-y-1 text-sm text-ink-300">
            <li>論文《Enhancing Firewall Rule Anomaly Detection via LLM Alignment》獲 TAAI 2025（台灣人工智慧領域指標性研討會）接受並發表</li>
            <li>開發個人網站，並協助開發台大藝術季第 30 屆官方網站</li>
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">工作經歷</p>
          <ul className="space-y-1 text-sm text-ink-300">
            <li>中研院資訊科學研究所 — Summer Intern（2025.07 – 2025.08）</li>
            <li>中研院資訊科技創新研究中心 — Research Assistant（2025.09 – 迄今）</li>
          </ul>
        </div>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">家教服務</h2>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">課程內容</p>
          <ul className="space-y-1 text-sm text-ink-300">
            <li>Python / C / C++ 語法教學</li>
            <li>進階演算法教學——透過 CPE、LeetCode 題目掌握核心演算法思維</li>
            <li>（有興趣的話）個人網站架設，從前端到後端、資料庫串接，一步步帶你做出自己的網站</li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">教學理念</p>
          <p className="mb-2 text-sm leading-relaxed text-ink-300">
            不管是 C、C++ 還是 Python，都是踏入程式世界最好的敲門磚。把基本語法學扎實，未來面對再複雜的專案都不用怕；而在掌握語法之後，真正能讓你脫穎而出的關鍵就是「演算法」。
            演算法常常讓人覺得抽象又困難，但透過生活化的方式拆解這些觀念，能讓學生更輕鬆吸收，真正建立起一套清晰的邏輯思維。
          </p>
          <p className="text-sm leading-relaxed text-ink-300">
            課程目標很明確：國高中生以挑戰 APCS 為目標，大學生則以 CPE 為目標。期待在一學期扎實的訓練後，能陪著學生一起考取亮眼的成績。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">教學方式</p>
            <p className="text-sm text-ink-300">線上（Google Meet）</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">收費方式</p>
            <p className="text-sm text-ink-300">
              NT$1,000 – 1,200 / 小時
              <br />
              <span className="text-ink-400">試教 NT$600</span>
            </p>
          </div>
        </div>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink-50">聯絡方式</h2>
        <p className="text-sm text-ink-300">
          Email：<span className="text-brand">ian52759@gmail.com</span>
        </p>
        <p className="mt-1.5 text-sm text-ink-300">
          個人網站：
          <a
            href="https://ian-tau.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            ian-tau.vercel.app
          </a>
        </p>
      </div>
    </div>
  );
}
