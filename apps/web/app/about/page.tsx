export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">關於我</h1>
        <p className="mt-2 text-sm text-ink-400">
          {/* TODO: 換成你自己的簡介 — 背景、經歷、專長領域等 */}
          這裡放你的自我介紹：學經歷、程式解題背景、教學風格等。
        </p>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink-50">家教服務</h2>
        <p className="text-sm text-ink-300">
          {/* TODO: 換成實際的家教資訊 — 教學科目、對象（CPE 檢定 / UVa 刷題 / 程式設計入門等）、上課方式（線上/實體）、時段、費用等 */}
          提供 CPE（大學程式能力檢定）與 UVa Online Judge 刷題一對一教學，依學生程度客製化課程內容與進度。
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink-400">
          <li>· 教學對象：{/* TODO */}高中／大學生，準備 CPE 檢定或程式設計基礎</li>
          <li>· 上課方式：{/* TODO */}線上 / 實體，依需求安排</li>
          <li>· 時段：{/* TODO */}請聯繫討論</li>
        </ul>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink-50">聯絡方式</h2>
        <p className="text-sm text-ink-300">
          {/* TODO: 換成真實聯絡方式 */}
          Email：<span className="text-brand">your-email@example.com</span>
        </p>
      </div>
    </div>
  );
}
