import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "服務條款",
  description: "judge. 的服務條款：帳號規範、使用限制、判題結果不保證、終止條件。",
  alternates: { canonical: `${SITE_URL}/terms` },
};

const LAST_UPDATED = "2026-08-23";

// Server Component, not translated to English: this is a legal document for a Taiwan-operated
// service under Taiwan law, and the site's i18n is a UX convenience for the product itself, not a
// second authoritative legal text — see privacy/refund pages for the same reasoning. Kept as a
// plain Server Component (no useT split like about/faq) since there's nothing here that needs to
// be locale-aware.
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8 text-sm leading-relaxed text-ink-300">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-50">服務條款</h1>
        <p className="mt-2 text-xs text-ink-500">最後更新：{LAST_UPDATED}</p>
        <p className="mt-4 text-sm text-ink-400">
          本文件不構成法律意見，僅為 judge.（以下稱「本站」）說明服務內容與使用規範。使用本站即表示你同意以下條款；如不同意，請勿使用本站服務。
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">1. 服務內容</h2>
        <p className="mt-2">
          本站提供程式解題練習、自動化判題、虛擬模擬考、題目集、討論區、班級追蹤等功能，主要面向準備大學程式能力檢定（CPE）與類似檢定的學生使用。本站部分題目透過本站自有的本地判題系統評分，部分題目（標示為需連接遠端判題的題目）透過 UVa Online Judge（onlinejudge.org）評分，詳見隱私權政策關於第三方資料傳輸的說明。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">2. 帳號</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>你可以使用電子郵件與密碼註冊，或使用 Google 帳號登入。</li>
          <li>你需對自己帳號下的所有活動負責，包含他人使用你帳號登入所產生的行為。若發現帳號遭未經授權使用，請立即透過下方聯絡方式通知我們。</li>
          <li>帳號名稱（handle）為公開資訊，會顯示在排行榜、討論區、個人頁面上，請勿使用足以識別他人身分或冒充他人的名稱。</li>
          <li>你可以隨時在「設定」頁面永久刪除帳號，詳見隱私權政策「如何刪除你的資料」一節。</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">3. 使用規範</h2>
        <p className="mt-2">使用本站時，你同意不會：</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>以任何自動化方式（爬蟲、腳本、機器人）大量存取本站，或嘗試繞過速率限制、配額限制。</li>
          <li>嘗試存取、修改、干擾他人帳號或非公開資料，或嘗試探測、利用本站的安全漏洞。</li>
          <li>在討論區、筆記、個人簡介等可公開內容欄位中發布違法、騷擾、廣告或侵犯他人權利的內容。</li>
          <li>將本站判題結果用於任何形式的學術不誠實行為（例如代替他人應考、集體舞弊）——本站是練習輔助工具，不對使用者如何運用練習成果負責。</li>
          <li>濫用免費方案的額度機制（例如透過建立多個帳號規避每月配額）。</li>
        </ul>
        <p className="mt-2">
          違反上述規範者，本站保留暫停或終止帳號的權利，且不另行退款（適用範圍請見退款與訂閱政策）。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">4. 題目內容與著作權</h2>
        <p className="mt-2">
          本站部分題目敘述轉載自 UVa Online Judge 及歷屆 CPE／GPE 考題，原始著作權歸屬原出題單位所有；本站僅作為練習輔助平台呈現這些內容，不主張對題目原文的著作權。每題頁面均標示出處與原文連結。如你認為本站內容侵犯你的權利，請透過下方聯絡方式與我們聯繫，我們會盡快處理。
        </p>
        <p className="mt-2">
          你在本站提交的原始碼（程式解答）歸你所有；本站僅為執行判題之目的暫時處理、儲存這些內容，不會將你的原始碼用於訓練模型、公開展示或提供給第三方（UVa 遠端判題題目除外，詳見隱私權政策）。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">5. 判題結果不保證</h2>
        <p className="mt-2">
          本站的判題結果是練習輔助工具，用以協助你評估解題正確性與效率，<strong className="text-ink-100">不保證與正式考試（CPE、GPE 或其他檢定）的判題結果完全一致</strong>。
          正式考試的測資規模、邊界條件、評分標準可能與本站不同；在本站通過（Accepted）不保證在正式考試中也會通過，反之亦然。本站測資持續擴充中，但目前部分題目測資量仍有限，請勿將本站結果作為應考準備完成度的唯一依據。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">6. Pro 訂閱與付款</h2>
        <p className="mt-2">
          Pro 方案的計價、扣款、取消規則請見
          <Link href="/refund" className="text-brand hover:underline">
            退款與訂閱政策
          </Link>
          。付款透過綠界科技（ECPay）處理，本站不會直接接觸或儲存你的完整卡號。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">7. 服務可用性</h2>
        <p className="mt-2">
          本站以現況（&quot;as is&quot;）提供服務，不保證服務不中斷或無錯誤。本站可能因維護、升級或其他原因暫時中止服務，將盡力事先公告重大異動。判題佇列在流量尖峰（例如考前衝刺期間）可能出現延遲，本站會持續改善承載能力，但不保證特定回應時間。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">8. 終止服務</h2>
        <p className="mt-2">
          你可以隨時停止使用本站或刪除帳號。本站保留在合理情況下（例如你違反第 3 條使用規範、長期未使用、或本站決定停止營運）暫停或終止你帳號存取權的權利。若本站決定全面停止服務，將提前公告，並依退款與訂閱政策處理當時仍在有效期內的付費方案。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">9. 責任限制</h2>
        <p className="mt-2">
          在法律允許的最大範圍內，本站及其營運者對於因使用或無法使用本站服務所產生的任何間接、附帶、衍生性損害（包含但不限於考試成績、學業表現）不負賠償責任。本站的直接賠償責任，於任何情況下不超過你於過去十二個月內就本站服務實際支付的金額。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">10. 條款修改</h2>
        <p className="mt-2">
          本站可能不時修改本條款，修改後會更新本頁「最後更新」日期。重大變更會透過站內通知或其他合理方式告知使用者。修改後繼續使用本站即視為同意新條款。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">11. 聯絡方式</h2>
        <p className="mt-2">
          對本條款有任何問題，歡迎寄信到{" "}
          <a href="mailto:judges0801@gmail.com" className="text-brand hover:underline">
            judges0801@gmail.com
          </a>
          。
        </p>
      </section>
    </div>
  );
}
