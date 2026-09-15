import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "退款與訂閱政策",
  description: "judge. Pro 方案的計價、自動續訂、取消規則與退款政策。",
  alternates: { canonical: `${SITE_URL}/refund` },
};

const LAST_UPDATED = "2026-09-15";

// Server Component, zh-TW only — see terms/page.tsx's file-level comment for why this isn't run
// through useT()/split into a client component like about/faq.
export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8 text-sm leading-relaxed text-ink-300">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-50">退款與訂閱政策</h1>
        <p className="mt-2 text-xs text-ink-500">最後更新：{LAST_UPDATED}</p>
        <p className="mt-4 text-sm text-ink-400">本文件不構成法律意見，僅說明 judge. Pro 方案的計價、扣款、取消與退款規則。</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">7 天首次付款退款保證</h2>
        <p className="mt-2">
          訂閱 Pro 後，在第一次扣款後 <strong className="text-ink-100">7 天（168 小時）內</strong>，可以在「升級方案」頁面自助申請
          <strong className="text-ink-100">全額退款</strong>——系統會受理申請，停止後續續扣並辦理第一筆付款的全額退款；退款確認後撤回該筆 Pro 使用權。信用卡實際入帳時間依發卡銀行作業為準。每個帳號只能使用這個退款資格一次。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">方案價格</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-ink-100">月繳方案：</strong>透過綠界科技（ECPay）信用卡定期定額扣款，每月自動續扣一次。
          </li>
          <li>
            <strong className="text-ink-100">年繳方案：</strong>第一次付款後即可使用 Pro 12 個月，之後每 12 個月自動續扣一次。
          </li>
        </ul>
        <p className="mt-2">
          Pro 方案目前僅支援信用卡定期定額付款。新訂閱的價格及活動期限以<Link href="/upgrade" className="text-brand underline">升級方案</Link>及結帳確認頁為準。
          訂閱建立時保存的金額，會維持於同一筆持續有效的訂閱，包含之後每一次自動續扣。日後調整定價不會改變既有訂閱的續扣金額；取消後重新訂閱則適用當時價格。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">開幕優惠與續訂價格保障</h2>
        <p className="mt-2">開幕活動實施期間，於方案頁公告的台北時間截止前建立訂閱訂單，首筆付款成功後，可鎖定月繳新台幣 200 元或年繳新台幣 2,000 元。只要同一筆訂閱、相同繳費週期持續有效，每次自動續扣都維持此金額，活動結束後也不會調漲。已建立訂單依該筆訂單保存的金額及資格處理，不因付款通知較晚抵達而重新計價。</p>
        <p className="mt-2">取消訂閱、退款而終止訂閱，或取消後更換月繳／年繳方案，原訂閱的價格保障即結束。之後重新訂閱，適用重新建立訂單時的價格與資格。取消後，已付款的使用權仍依本政策保留至當期到期日；退款則依退款規則處理。付款暫時失敗、金流仍在重試時，原訂閱金額不會自動調整；若金流已終止續扣，請聯絡客服確認訂閱狀態。</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">自動續訂與扣款時點</h2>
        <p className="mt-2">
          Pro 訂閱採自動續訂制：月繳方案於每期到期日自動扣款一次，年繳方案於每滿 12 個月自動扣款一次。扣款透過綠界科技的信用卡定期定額機制處理，扣款結果為自動核准，不需人工審核；扣款成功後，Pro 權限通常在數十秒到幾分鐘內自動延長。
        </p>
        <p className="mt-2">
          如果扣款成功但超過 10 分鐘帳號仍未升級，請先重新整理頁面確認不是快取問題；若仍未更新，請透過下方聯絡方式與我們聯繫，並附上付款時間，我們會協助補上 Pro 權限。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">如何取消訂閱</h2>
        <p className="mt-2">
          你可以隨時在「升級方案」頁面點選取消訂閱，取消後：
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>系統會立即停止未來的自動扣款——不會再對你的信用卡扣款。</li>
          <li>
            <strong className="text-ink-100">
              你已經付費的這段期間，Pro 權限會持續使用到當期到期日為止
            </strong>
            ，不會因為取消而立即失去 Pro 權限——這是因為你已經為這整個週期付費，提前中止會讓你損失已付費但尚未使用的天數，所以本站採用「期末終止」而非「立即中止」的方式處理取消。
          </li>
          <li>到期後帳號會自動回復為 Free 方案，除非你之後重新訂閱。</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">退款規則</h2>
        <p className="mt-2">
          除了上方「7 天首次付款退款保證」的範圍（首次付款成功後 7 天內、每帳號限一次）之外，
          <strong className="text-ink-100">已扣款的費用原則上不予退還</strong>
          ，包含但不限於：超過7 天退款期限才決定取消、忘記取消導致的續扣、對判題結果或功能不滿意等情形。取消訂閱只會停止未來續扣，不會退還當期已付費用（但如上所述，當期 Pro 權限仍可使用到到期日）。
        </p>
        <p className="mt-2">以下情形本站會主動處理退款或補償：</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>因本站系統錯誤導致重複扣款。</li>
          <li>扣款成功但因本站故障始終未能升級為 Pro，且無法透過人工補發解決。</li>
          <li>依消費者保護相關法規本站有退款義務的其他情形。</li>
        </ul>
        <p className="mt-2">
          若你認為自己符合上述情形，請透過下方聯絡方式與我們聯繫，並附上訂單時間與（如適用）扣款證明，我們會盡快處理。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">方案降級</h2>
        <p className="mt-2">
          Pro 使用者可隨時申請降級為 Free，規則與取消訂閱相同：已付費期間會持續使用到到期日，不會立即失去 Pro 權限，也不會退還已付費用。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">與帳號刪除的關係</h2>
        <p className="mt-2">
          若你在有進行中的 Pro 訂閱時刪除帳號，系統會在刪除前自動為你取消 ECPay 定期定額扣款，確保帳號刪除後不會再被扣款；但依上方退款規則，已扣款的費用不會因帳號刪除而退還。詳見
          <Link href="/privacy" className="text-brand underline decoration-brand/50 underline-offset-4 hover:decoration-brand">
            隱私權政策
          </Link>
          。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">政策修改</h2>
        <p className="mt-2">
          本站可能不時修改本政策，修改後會更新本頁「最後更新」日期。任何調整都不會溯及既往地改變你既有訂閱的價格或已生效的取消/退款結果。
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">聯絡方式</h2>
        <p className="mt-2">
          對訂閱或扣款有任何問題，歡迎寄信到{" "}
          <a href="mailto:judges0801@gmail.com" className="text-brand underline decoration-brand/50 underline-offset-4 hover:decoration-brand">
            judges0801@gmail.com
          </a>
          。
        </p>
      </section>
    </div>
  );
}
