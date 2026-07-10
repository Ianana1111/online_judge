export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-14 py-8">
      {/* ---- About the site ---- */}
      <section>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-brand">About this site</p>
        <h1 className="font-display text-3xl font-bold leading-tight text-ink-50">為台灣資工人打造的 CPE 練習平台</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          這裡收錄了歷屆 CPE（大學程式能力檢定）考古題，串接真正的 UVa Online Judge 判題，讓你送出的每一份程式碼都拿到跟正式考試一樣真實的結果——不是自己猜對錯，而是貨真價實的
          Accepted 或 Wrong Answer。你可以按主題、難度挑題練習，也能直接開一場限時的模擬考，練習抓緊考試節奏。
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          市面上不缺刷題平台——LeetCode、Codeforces 這類國際競程網站琳瑯滿目，但沒有一個是為台灣資工學生量身打造的：題型、考試制度、升學管道，都跟我們真正要面對的 CPE 對不上。
          我自己也是一路準備這些檢定過來的學生，很清楚那種找不到「剛好符合台灣體制」練習資源的困擾，所以決定自己動手做一個，把它變成每個準備 CPE 的人都能用的地方，而不只是我自己教學用的工具。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-ink-50">為什麼叫 judge？</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-300">
          學程式的路上，我們太習慣等別人幫自己打分數——等老師改考卷、等助教說一句「這樣寫可以嗎」、等面試官給個評語。但
          <span className="text-brand">judge</span>
          這個字，本來的意思就是裁判：在這裡，每一次 Submit 都會得到最誠實、最不留情面的裁決，Accepted 就是
          Accepted，Wrong Answer 就是 Wrong Answer，沒有模糊地帶，也沒有人情分數可以打。
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          久而久之你會發現，真正在幫你打分數的從來不是這個系統，而是你自己——你會開始清楚知道自己哪裡還不夠扎實、哪個技巧還沒真正練熟、離上考場還差多遠。這個網站想做的，就是把這把最誠實的尺交到你手上，讓你成為自己的
          <span className="text-brand">judge</span>。想把 CPE 準備好、把演算法基本功練扎實，來這裡刷題，就是最對的選擇。
        </p>
      </section>

      <hr className="border-ink-800" />

      {/* ---- About the author ---- */}
      <section>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-brand">About the author</p>
        <h2 className="font-display text-2xl font-bold text-ink-50">關於架站的人</h2>
        <p className="mt-2 text-sm text-ink-400">
          台大資工系學生，現於中研院當 Research Assistant Intern，帶學生準備 APCS 與 CPE 檢定、打好程式基礎。
        </p>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">學歷</h3>
            <ul className="space-y-1.5 text-sm text-ink-300">
              <li>國立台灣大學 電機資訊學院資料科學碩士學位學程（準碩一）</li>
              <li>國立台灣大學 資訊工程學系 畢業</li>
              <li>國立台灣師範大學附屬高級中學 畢業</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">工作經歷</h3>
            <ul className="space-y-1.5 text-sm text-ink-300">
              <li>中研院資訊科技創新研究中心 — BCI Lab - Research Assistant（2025.09 – 迄今）</li>
              <li>中研院資訊科學研究所 — Summer Intern（2025.07 – 2025.08）</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">學科成績</h3>
            <ul className="space-y-1.5 text-sm text-ink-300">
              <li>GPE 580 / 600（交大資工畢業門檻為 240 / 600）</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">研究與專案</h3>
            <ul className="space-y-1.5 text-sm text-ink-300">
              <li>
                論文《Enhancing Firewall Rule Anomaly Detection via LLM Alignment》獲 TAAI 2025（台灣人工智慧領域指標性研討會）接受並發表
              </li>
              <li>開發個人網站，並協助開發台大藝術季第 30 屆官方網站</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Tutoring CTA ---- */}
      <section className="oj-card border-brand/30 p-6">
        <h2 className="font-display text-xl font-bold text-ink-50">程式家教</h2>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">課程內容</h3>
            <ul className="space-y-1 text-sm text-ink-300">
              <li>C++ / C / Python 語法教學</li>
              <li>進階演算法教學——透過 CPE、LeetCode 題目掌握核心演算法思維</li>
              <li>（有興趣的話）個人網站架設，從前端到後端、資料庫串接，一步步做出自己的網站</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">教學方式</h3>
              <p className="text-sm text-ink-300">線上（Google Meet）</p>
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">收費方式</h3>
              <p className="text-sm text-ink-300">
                NT$1,000 – 1,200 / 小時
                <br />
                <span className="text-ink-400">試教 NT$600</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">教學理念</h3>
          <p className="text-sm leading-relaxed text-ink-300">
            不管是 C、C++ 還是 Python，都是踏入程式世界最好的敲門磚。把基本語法學扎實，未來面對再複雜的專案都不用怕；而在掌握語法之後，真正能讓你脫穎而出的關鍵就是「演算法」。
            演算法常常讓人覺得抽象又困難，但透過生活化的方式拆解這些觀念，能讓學生更輕鬆吸收，真正建立起一套清晰的邏輯思維。國高中生以挑戰 APCS 為目標，大學生則以 CPE 為目標——期待在一學期扎實的訓練後，能陪著學生一起考取亮眼的成績。
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-ink-800 pt-4 text-sm text-ink-300">
          <span>
            Email：<span className="text-brand">ian52759@gmail.com</span>
          </span>
          <span>
            個人網站：
            <a
              href="https://ian-tau.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              ian-tau.vercel.app
            </a>
          </span>
        </div>
      </section>
    </div>
  );
}
