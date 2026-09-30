import Link from "next/link";
import AdminProductDashboard from "@/components/AdminProductDashboard";
import AdminAudienceDashboard from "@/components/AdminAudienceDashboard";
import AdminTrafficDashboard from "@/components/AdminTrafficDashboard";
import AdminLearningAnalytics from "@/components/AdminLearningAnalytics";

const tabs = [
  { key: "product", label: "產品與金流", description: "購買、續訂、退訂與產品使用情形，集中在同一處觀察。" },
  { key: "audience", label: "訪客與地區", description: "從進站來源到互動與地區分布，了解使用者如何找到並使用網站。" },
  { key: "learning", label: "題庫表現", description: "歷屆難度、演算法主題與平台解題表現。" },
];
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = tabs.find(tab => tab.key === params.tab) ?? tabs[0];
  return <div className="space-y-7">
    <header><h1 className="font-display text-2xl font-bold text-ink-50">數據分析</h1><p className="mt-2 text-sm leading-6 text-ink-400">{active.description}</p></header>
    <nav aria-label="分析類別" className="flex gap-1 overflow-x-auto rounded-xl border border-ink-700 bg-ink-900/40 p-1.5">
      {tabs.map(tab => <Link key={tab.key} href={`/admin/analytics?tab=${tab.key}`} aria-current={active.key === tab.key ? "page" : undefined} className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${active.key === tab.key ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800"}`}>{tab.label}</Link>)}
    </nav>
    {active.key === "product" ? <AdminProductDashboard /> : active.key === "audience" ? <div className="space-y-10"><AdminAudienceDashboard /><AdminTrafficDashboard /></div> : <AdminLearningAnalytics />}
  </div>;
}
