import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "judge. 如何蒐集、使用、保存你的個人資料，以及如何行使你的個資法權利。",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const LAST_UPDATED = "2026-08-23";

// Server Component, zh-TW only — see terms/page.tsx's file-level comment for why this isn't run
// through useT()/split into a client component like about/faq.
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8 text-sm leading-relaxed text-ink-300">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-50">隱私權政策</h1>
        <p className="mt-2 text-xs text-ink-500">最後更新：{LAST_UPDATED}</p>
        <p className="mt-4 text-sm text-ink-400">
          本文件不構成法律意見，僅為 judge.（以下稱「本站」）依台灣個人資料保護法（PDPA）說明蒐集、處理、利用個人資料的方式。
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">我們蒐集哪些資料</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-ink-100">帳號資訊：</strong>電子郵件、帳號名稱（handle）、密碼（以 argon2 雜湊儲存，本站無法還原你的原始密碼）。若使用 Google 登入，我們會取得你的 Google 帳號 ID 與該帳號已驗證的電子郵件。
          </li>
          <li>
            <strong className="text-ink-100">個人檔案（選填）：</strong>大頭貼、一句話簡介（座右銘）、就讀學校。大頭貼與簡介會顯示在你的公開個人頁面；學校若經過驗證會顯示在排行榜的學校分組上。
          </li>
          <li>
            <strong className="text-ink-100">學校信箱驗證：</strong>若你選擇驗證學校身分，我們會將驗證信寄到你提供的學校網域信箱（如 xxx@ntu.edu.tw），並記錄驗證時間。未驗證前這個信箱不會公開顯示。
          </li>
          <li>
            <strong className="text-ink-100">解題與學習紀錄：</strong>你提交的原始碼、判題結果、提交時間、使用的程式語言、每日練習紀錄、成就徽章、虛擬模擬考的作答與計時紀錄。
          </li>
          <li>
            <strong className="text-ink-100">討論與筆記：</strong>你在討論區發布的留言（公開）、針對題目撰寫的個人筆記（僅你自己看得到）。
          </li>
          <li>
            <strong className="text-ink-100">金流資訊：</strong>若你訂閱 Pro 方案，付款由第三方金流商綠界科技（ECPay）處理；本站不會接觸或儲存你的完整卡號，只會保留訂單編號、金額、付款狀態等交易紀錄。
          </li>
          <li>
            <strong className="text-ink-100">使用紀錄：</strong>造訪的頁面路徑、造訪時間、referrer 網域，用於了解流量與改善服務，最長保留 400 天後自動清除。這項紀錄不含 IP 位址對應到帳號的追蹤，也不用於廣告投放。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">我們如何使用這些資料</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>提供帳號登入、解題判題、排行榜、討論區、班級追蹤、虛擬模擬考等核心功能。</li>
          <li>處理 Pro 方案的訂閱、扣款、到期提醒。</li>
          <li>寄送帳號相關通知信件（例如學校信箱驗證信），透過第三方寄信服務 Resend 代為發送。</li>
          <li>維運與除錯：了解服務異常、流量趨勢，改善效能與穩定性。</li>
          <li>防止濫用：例如速率限制、偵測異常的自動化存取行為。</li>
        </ul>
        <p className="mt-2">我們不會將你的個人資料用於本政策所述以外的目的，也不會出售你的個人資料。</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">
          第三方服務——特別是 UVa 遠端判題會外送你的原始碼
        </h2>
        <p className="mt-2">本站使用以下第三方服務，它們可能因此接觸到你的部分資料：</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-ink-100">UVa Online Judge（onlinejudge.org）：</strong>本站絕大多數題目在自有的本地判題系統上評分，
            <strong className="text-ink-100">你的原始碼不會離開本站</strong>。但目前有極少數題目（本地測資尚未補齊）會透過本站的共用帳號，將你提交的原始碼轉送到 UVa Online Judge 進行遠端評分，評分結果取回後才顯示給你。這代表：對於這些少數題目，你的原始碼會被傳送給這個第三方網站處理。我們正在逐步補齊這些題目的本地測資以減少此類轉送；相關題目頁面上通常會標示為需要遠端判題。
          </li>
          <li>
            <strong className="text-ink-100">綠界科技（ECPay）：</strong>處理 Pro 方案的信用卡與 ATM 付款，接觸你的付款資訊（本站不接觸完整卡號）。
          </li>
          <li>
            <strong className="text-ink-100">Resend：</strong>代為寄送學校信箱驗證等系統信件，會接觸你的電子郵件地址與信件內容。
          </li>
          <li>
            <strong className="text-ink-100">Google：</strong>若你使用 Google 登入，Google 會依其自身隱私權政策處理登入授權過程中的資料。
          </li>
          <li>
            <strong className="text-ink-100">Vercel：</strong>本站的網站主機與前端分析（Vercel Analytics）供應商，處理標準的網站託管與匿名流量統計資料。
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">資料保存期限</h2>
        <p className="mt-2">
          帳號相關資料（提交紀錄、討論留言、個人檔案等）會保存至你刪除帳號為止。使用紀錄（頁面瀏覽）最長保留 400 天後自動清除。若你刪除帳號，詳見下方「如何刪除你的資料」。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">你的權利</h2>
        <p className="mt-2">依台灣個人資料保護法，你對本站持有的個人資料享有以下權利：</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>查詢或請求閱覽你的個人資料。</li>
          <li>請求製給複本。</li>
          <li>請求補充或更正——大部分個人檔案欄位可直接在「設定」頁面自行修改。</li>
          <li>請求停止蒐集、處理或利用，或請求刪除。</li>
        </ul>
        <p className="mt-2">
          除了下方可自助操作的刪除帳號功能外，如需行使以上其他權利，請透過下方聯絡方式與我們聯繫，我們會在合理時間內回覆處理。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">如何刪除你的資料</h2>
        <p className="mt-2">
          你可以在
          <Link href="/settings" className="text-brand hover:underline">
            設定 → 帳號
          </Link>
          頁面的「危險區域」自行永久刪除帳號。刪除後，你的提交紀錄、討論留言、筆記、成就、個人檔案等資料會被永久移除，此操作無法復原；若你當時有進行中的 Pro 訂閱，系統會先為你取消，之後不會再扣款。
        </p>
        <p className="mt-2">
          少數依法必須保留的紀錄（例如已完成的金流交易憑證，依稅務與會計法規要求保存）可能在帳號刪除後仍會留存一段時間，但不再與你的帳號其他資料關聯。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">資料安全</h2>
        <p className="mt-2">
          密碼以 argon2 雜湊儲存；所有連線均透過 HTTPS 加密；本站有實作速率限制、CSRF 防護等機制降低資料外洩風險。但沒有任何系統能保證絕對安全，若發生資料外洩事件，我們會依法通知受影響的使用者與主管機關。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">兒童隱私</h2>
        <p className="mt-2">本站服務對象為準備大學程式能力檢定的學生，不特別針對兒童設計，也不會刻意向兒童蒐集個人資料。</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">政策修改</h2>
        <p className="mt-2">
          本站可能不時修改本政策，修改後會更新本頁「最後更新」日期。重大變更（例如新增會外送資料的第三方服務）會透過站內通知或其他合理方式告知使用者。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">聯絡方式</h2>
        <p className="mt-2">
          對本政策或你的個人資料有任何問題，歡迎寄信到{" "}
          <a href="mailto:judges0801@gmail.com" className="text-brand hover:underline">
            judges0801@gmail.com
          </a>
          。
        </p>
      </section>
    </div>
  );
}
