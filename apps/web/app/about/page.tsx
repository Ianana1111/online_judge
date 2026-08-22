import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "About",
  description: "為台灣資工人打造的 CPE 練習平台——歷屆考古題、自動化判題、限時模擬考。",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-14 py-8">
      {/* ---- About the site ---- */}
      <section>
        <Eyebrow text="About this site" />
        <h1 className="font-display text-3xl font-bold leading-tight text-ink-50">為台灣資工人打造的 CPE 練習平台</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          這裡收錄了歷屆 CPE（大學程式能力檢定）考古題，每一份程式碼都會經過嚴謹的自動化判題，讓你拿到跟正式考試一樣真實的結果——不是自己猜對錯，而是貨真價實的
          Accepted 或 Wrong Answer。你可以按主題、難度挑題練習，也能直接開一場限時的模擬考，練習抓緊考試節奏。
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          市面上不缺刷題平台——LeetCode、Codeforces 這類國際競程網站琳瑯滿目，但沒有一個是為台灣資工學生量身打造的：題型、考試制度、升學管道，都跟我們真正要面對的 CPE 對不上。
          我自己也是一路準備這些檢定過來的學生，很清楚那種找不到「剛好符合台灣體制」練習資源的困擾，所以決定自己動手做一個，把它變成每個準備 CPE 的人都能用的地方，而不只是我自己教學用的工具。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-ink-50">為什麼叫 judge？</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-300">
          學程式的路上，我們太習慣等別人幫自己打分數——等老師改考卷、等助教說一句「這樣寫可以嗎」、等面試官給個評語。但
          <span className="text-brand"> judge </span>
          這個字，本來的意思就是裁判：在這裡，每一次 Submit 都會得到最誠實、最不留情面的裁決，Accepted 就是
          Accepted，Wrong Answer 就是 Wrong Answer，沒有模糊地帶，也沒有人情分數可以打。
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-300">
          久而久之你會發現，真正在幫你打分數的從來不是這個系統，而是你自己——你會開始清楚知道自己哪裡還不夠扎實、哪個技巧還沒真正練熟、離上考場還差多遠。這個網站想做的，就是把這把最誠實的尺交到你手上，讓你成為自己的
          <span className="text-brand"> judge</span>。想把 CPE 準備好、把演算法基本功練扎實，來這裡刷題，就是最對的選擇。
        </p>
      </section>
    </div>
  );
}
