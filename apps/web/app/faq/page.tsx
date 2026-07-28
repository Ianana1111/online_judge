import Link from "next/link";

const SECTIONS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "帳號與 Pro 方案",
    items: [
      {
        q: "我已經付款了，但帳號還沒有升級成 Pro，怎麼辦？",
        a: (
          <>
            信用卡與 ATM 付款都是全自動核准的：完成刷卡後系統會在數十秒到幾分鐘內自動偵測並升級，不需要任何人工審核。如果付款成功超過
            10 分鐘帳號仍顯示 Free，請先重新整理頁面確認不是快取問題；如果還是沒有更新，請透過
            <span className="text-brand"> judges0801@gmail.com </span>
            聯絡我們，並附上付款當下的時間與（如果有的話）ATM 轉帳帳號末五碼，我們會直接為你補上 Pro。
          </>
        ),
      },
      {
        q: "Pro 方案有哪些權益？",
        a: "無限次數的程式碼提交、無限次自己開的虛擬模擬考、看到每題「歷屆出過幾次」的統計與依此排序、完整的討論區與排行榜存取，以及優先支援。",
      },
      {
        q: "免費方案有什麼限制？",
        a: "每個日曆月可以提交 10 次程式碼、開 1 場虛擬模擬考，額度會在每個月初自動重置，不需要手動申請。",
      },
      {
        q: "Pro 方案要怎麼取消？",
        a: "在 Upgrade Plan 頁面按下「取消訂閱」即可——這裡沒有自動續訂機制，每次付款都是單次購買、延長既有的到期日，所以「取消」只是設定一個標記，讓帳號在目前的 Pro 到期後自動變回 Free，不會立即失去 Pro，也不會有任何退款產生。",
      },
      {
        q: "可以退款嗎？",
        a: "目前所有付款都視為單次購買且立即生效，不提供退款。如果是誤刷或系統錯誤（例如刷了卡但金額不對），請直接聯絡我們協助處理。",
      },
      {
        q: "忘記密碼怎麼辦？",
        a: (
          <>
            目前還沒有自助重設密碼的功能——如果你的帳號是用 Google 登入建立的，直接用「使用 Google 登入」即可繞過密碼；如果是帳密註冊的帳號忘記密碼，請寄信到
            <span className="text-brand"> judges0801@gmail.com </span>
            告訴我們你的帳號 handle，我們會協助你重設。
          </>
        ),
      },
    ],
  },
  {
    title: "提交與判題",
    items: [
      {
        q: "我的程式在別的 Online Judge 上是 AC，這裡卻是 Wrong Answer 或 TLE，為什麼？",
        a: "最常見的原因是輸出格式差一個空白、換行，或是時間限制設定和原始題目不完全一致。我們的判題標準是對齊題目原始出處（例如 UVa）實際會接受的結果——如果你確定程式邏輯正確、且能在原始出處上通過，歡迎回報，我們會檢查資料/限制是否有誤並修正。",
      },
      {
        q: "各種判題結果（Verdict）分別是什麼意思？",
        a: (
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li><b>Accepted (AC)</b>：完全正確。</li>
            <li><b>Wrong Answer (WA)</b>：輸出與正確答案不符。</li>
            <li><b>Time Limit Exceeded (TLE)</b>：程式跑太久，超過題目的時間限制。</li>
            <li><b>Memory Limit Exceeded (MLE)</b>：用掉的記憶體超過題目限制。</li>
            <li><b>Runtime Error (RE)</b>：程式執行中當掉（常見於陣列越界、除以零、空指標）。</li>
            <li><b>Compile Error (CE)</b>：程式碼無法編譯成功，通常是語法錯誤。</li>
            <li><b>Presentation Error (PE)</b>：內容其實正確，但空白、換行等格式跟預期不同。</li>
            <li><b>Output Limit Exceeded (OLE)</b>：輸出的內容量遠超過預期，通常代表程式陷入無窮迴圈狂印東西。</li>
            <li><b>Restricted Function (RF)</b>：使用了被禁止的系統呼叫或函式（例如嘗試存取檔案系統、開子行程）。</li>
            <li><b>System Error (SE)</b>：評測系統本身出錯，不是你的程式的問題——如果一直出現，麻煩回報給我們。</li>
          </ul>
        ),
      },
      {
        q: "為什麼我不能一直連續提交？",
        a: "每次提交後有 10 秒的冷卻時間，避免誤觸或短時間內對同一題狂送造成評測負擔。倒數結束後就能再次提交。",
      },
      {
        q: "判題結果要等多久？",
        a: "正常情況下幾秒到一分鐘內就會出結果，頁面會即時更新不需要重新整理。如果長時間卡在「Judging」，通常是評測系統忙線，稍等一下或重新整理頁面即可。",
      },
      {
        q: "為什麼有些題目不能提交？",
        a: "少數題目（多半是舊的 GPE 考古題）沒有對應到任何真實的判題來源，只作為練習/閱讀用途，這種題目的提交按鈕會顯示「Not gradeable」並停用，題目頁面上也會特別註明。",
      },
      {
        q: "可以用什麼語言提交？",
        a: "目前支援 C++17、C11、Python 3、Java 17。預設的程式碼樣板刻意使用標準的 <iostream>/<stdio.h>，避免使用 <bits/stdc++.h> 這類非標準標頭檔——因為部分判題來源的編譯器不支援它，用了反而會 Compile Error。",
      },
    ],
  },
  {
    title: "比賽與虛擬模擬考",
    items: [
      {
        q: "虛擬模擬考是怎麼運作的？",
        a: (
          <>
            每一場都是一次歷屆 CPE 或 GPE 的重現：從
            <Link href="/contests" className="text-brand hover:underline"> Contests </Link>
            頁面挑一場開始，倒數計時就會啟動，題目、時限都跟當年正式考試一樣，全程只有你自己看得到、只計入你自己的紀錄，隨時可以開始，不需要跟別人同場。
          </>
        ),
      },
      {
        q: "虛擬模擬考中途可以離開嗎？",
        a: "可以，倒數計時不會因為你離開頁面而暫停，但也不會消失——回來的時候會接續原本的倒數，時間到就會自動結算，所以建議開始前先確保接下來有完整的時間可以應考。",
      },
      {
        q: "免費方案一個月只能開一次虛擬模擬考嗎？",
        a: "是的，免費方案每個日曆月可以開 1 場，額度在月初自動重置；Pro 方案沒有次數限制。",
      },
      {
        q: "虛擬模擬考的成績會影響排行榜嗎？",
        a: "會，每場模擬考都有自己的計分（含罰時），可以在該場比賽頁面看到即時排名；平常的單題練習也會累計進整體排行榜與你的個人 Activity 頁面。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">FAQ</h1>
        <p className="mt-1 text-sm text-ink-400">
          常見問題整理。找不到答案的話，歡迎寄信到 <span className="text-brand">judges0801@gmail.com</span>。
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <details key={item.q} className="oj-card group p-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink-100 marker:content-none group-open:text-brand">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                  {item.q}
                </summary>
                <div className="mt-3 pl-4 text-sm leading-relaxed text-ink-300">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
