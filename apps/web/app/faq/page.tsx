import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonLd";
import FaqContent from "@/components/FaqContent";

export const metadata: Metadata = {
  title: "FAQ",
  description: "常見問題整理：Pro 方案、付款、判題結果、虛擬模擬考怎麼運作。",
  alternates: { canonical: `${SITE_URL}/faq` },
};

// Kept separate from the (translatable, client-side) visible content in FaqContent.tsx: this
// represents the page's one canonical, indexed language (zh-TW, matching <html lang="zh-TW"> in
// the root layout) for search engines, not a locale-aware structured-data variant — and `plain`
// mirrors `a` in FaqContent only for the sections that need it, kept in sync by hand since
// reconstructing plain text by parsing JSX would be far more fragile than writing it twice.
const FAQ_SECTIONS_ZH: { title: string; items: { q: string; plain: string }[] }[] = [
  {
    title: "帳號與 Pro 方案",
    items: [
      {
        q: "我已經付款了，但帳號還沒有升級成 Pro，怎麼辦？",
        plain:
          "付款都是全自動核准的：完成刷卡後系統會在數十秒到幾分鐘內自動偵測並升級，不需要任何人工審核。如果付款成功超過 10 分鐘帳號仍顯示 Free，請先重新整理頁面確認不是快取問題；如果還是沒有更新，請透過 judges0801@gmail.com 聯絡我們，並附上付款當下的時間，我們會直接為你補上 Pro。",
      },
      {
        q: "Pro 方案有哪些權益？",
        plain: "無限次數的程式碼提交、無限次自己開的虛擬模擬考、看到每題「歷屆出過幾次」的統計與依此排序、完整的討論區與排行榜存取，以及優先支援。",
      },
      {
        q: "免費方案有什麼限制？",
        plain: "每個日曆月可以提交 10 次程式碼、開 1 場虛擬模擬考，額度會在每個月初自動重置，不需要手動申請。",
      },
      {
        q: "Pro 方案要怎麼取消？",
        plain:
          "在 Upgrade Plan 頁面按下「取消訂閱」即可——這會停止之後的自動續扣，但目前這期已付費的 Pro 權限會持續使用到到期日，之後才自動變回 Free。已扣款的當期費用不會退還（除非你還在首月退款期限內，見下一題）。",
      },
      {
        q: "可以退款嗎？",
        plain:
          "第一次扣款後 30 天內可以在 Upgrade Plan 頁面自助申請全額退款——會取消訂閱並立即切換回 Free，每個帳號限用一次。詳見退款與訂閱政策頁面。",
      },
      {
        q: "忘記密碼怎麼辦？",
        plain:
          "目前還沒有自助重設密碼的功能——如果你的帳號是用 Google 登入建立的，直接用「使用 Google 登入」即可繞過密碼；如果是帳密註冊的帳號忘記密碼，請寄信到 judges0801@gmail.com 告訴我們你的帳號 handle，我們會協助你重設。",
      },
    ],
  },
  {
    title: "提交與判題",
    items: [
      {
        q: "我拿到 Wrong Answer 或 TLE，但我很確定邏輯是對的，該怎麼辦？",
        plain:
          "先回去仔細對一次題目敘述裡規定的輸出格式——很多 WA 其實是小地方沒對到：漏了一個換行、多了一個空白、或是一個容易漏掉的邊界情況。如果你已經仔細檢查過，還是覺得哪裡不對，歡迎寫信到 judges0801@gmail.com 並附上你的提交，我們會幫你看看。",
      },
      {
        q: "各種判題結果（Verdict）分別是什麼意思？",
        plain:
          "Accepted (AC)：完全正確。Wrong Answer (WA)：輸出與正確答案不符。Time Limit Exceeded (TLE)：程式跑太久，超過題目的時間限制。Memory Limit Exceeded (MLE)：用掉的記憶體超過題目限制。Runtime Error (RE)：程式執行中當掉。Compile Error (CE)：程式碼無法編譯成功。Presentation Error (PE)：內容正確但格式不同。Output Limit Exceeded (OLE)：輸出量遠超預期。Restricted Function (RF)：使用了被禁止的系統呼叫或函式。System Error (SE)：評測系統本身出錯。",
      },
      {
        q: "為什麼我不能一直連續提交？",
        plain: "每次提交後有 10 秒的冷卻時間，避免誤觸或短時間內對同一題狂送造成評測負擔。倒數結束後就能再次提交。",
      },
      {
        q: "判題結果要等多久？",
        plain: "正常情況下幾秒到一分鐘內就會出結果，頁面會即時更新不需要重新整理。如果長時間卡在「Judging」，通常是評測系統忙線，稍等一下或重新整理頁面即可。",
      },
      {
        q: "為什麼有些題目不能提交？",
        plain: "少數題目（多半是舊的 GPE 考古題）沒有對應到任何真實的判題來源，只作為練習/閱讀用途，這種題目的提交按鈕會顯示「Not gradeable」並停用，題目頁面上也會特別註明。",
      },
      {
        q: "可以用什麼語言提交？",
        plain:
          "目前支援 C++17、C11、Python 3、Java 17。預設的程式碼樣板刻意使用標準的 iostream/stdio.h，避免使用 bits/stdc++.h 這類非標準標頭檔——因為部分判題來源的編譯器不支援它，用了反而會 Compile Error。",
      },
    ],
  },
  {
    title: "比賽與虛擬模擬考",
    items: [
      {
        q: "虛擬模擬考是怎麼運作的？",
        plain:
          "每一場都是一次歷屆 CPE 或 GPE 的重現：從 Contests 頁面挑一場開始，倒數計時就會啟動，題目、時限都跟當年正式考試一樣，全程只有你自己看得到、只計入你自己的紀錄，隨時可以開始，不需要跟別人同場。",
      },
      {
        q: "虛擬模擬考中途可以離開嗎？",
        plain: "可以，倒數計時不會因為你離開頁面而暫停，但也不會消失——回來的時候會接續原本的倒數，時間到就會自動結算，所以建議開始前先確保接下來有完整的時間可以應考。",
      },
      {
        q: "免費方案一個月只能開一次虛擬模擬考嗎？",
        plain: "是的，免費方案每個日曆月可以開 1 場，額度在月初自動重置；Pro 方案沒有次數限制。",
      },
      {
        q: "虛擬模擬考的成績會影響排行榜嗎？",
        plain: "會，每場模擬考都有自己的計分（含罰時），可以在該場比賽頁面看到即時排名；平常的單題練習也會累計進整體排行榜與你的個人 Activity 頁面。",
      },
    ],
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS_ZH.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.plain },
    })),
  ),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(FAQ_JSON_LD) }} />
      <FaqContent />
    </>
  );
}
