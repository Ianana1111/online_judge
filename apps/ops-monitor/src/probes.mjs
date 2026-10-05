/** Bounded, read-only production probes; no account, payment or judge credentials. */
export const PROBES = [
  { id: "web", name: "網站首頁", path: "/", origin: "web", check: (r, body) => r.status === 200 && /judge/i.test(body) },
  { id: "api", name: "API／資料庫／Redis", path: "/health", check: (r, body) => r.status === 200 && JSON.parse(body).status === "ok" },
  { id: "problems", name: "題庫讀取", path: "/problems?page=1&pageSize=1", check: (r, body) => r.status === 200 && JSON.parse(body).items.length > 0 },
  { id: "contests", name: "虛擬測驗目錄", path: "/contests", check: (r, body) => r.status === 200 && JSON.parse(body).length > 0 },
  { id: "plans", name: "訂閱方案讀取", path: "/billing/plans", check: (r, body) => r.status === 200 && ["ecpay", "stripe"].includes(JSON.parse(body).checkoutProvider) },
  { id: "google", name: "Google 登入導向", path: "/auth/google", check: r => {
    if (![302, 303].includes(r.status)) return false;
    const url = new URL(r.headers.get("location") ?? "invalid:");
    return url.origin === "https://accounts.google.com" && !!url.searchParams.get("state") && new URL(url.searchParams.get("redirect_uri")).hostname === "api.judge.tw";
  } },
  { id: "editorial", name: "詳解訪客權限", path: "/problems/uva-100-the-3n-1-problem/editorial", check: (r, body) => r.status === 200 && JSON.parse(body).status === "AUTH_REQUIRED" },
];
export async function readBounded(response, maxBytes = 1_000_000) {
  const reader = response.body?.getReader(); if (!reader) return "";
  const chunks = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > maxBytes) throw new Error("Response too large"); chunks.push(value); }
    return Buffer.concat(chunks).toString("utf8");
  } finally { await reader.cancel().catch(() => {}); }
}
export async function probeAll({ webOrigin = "https://judge.tw", apiOrigin = "https://api.judge.tw", request = fetch } = {}) {
  for (const origin of [webOrigin, apiOrigin]) { const url = new URL(origin); if (!(["https:", "http:"].includes(url.protocol)) || url.username || url.password || url.pathname !== "/") throw new Error("Invalid probe origin"); }
  return Promise.all(PROBES.map(async probe => {
    const started = Date.now(); let httpStatus = null, ok = false;
    try {
      const response = await request((probe.origin === "web" ? webOrigin : apiOrigin) + probe.path, { redirect: "manual", signal: AbortSignal.timeout(12_000), headers: { "user-agent": "JudgeOps-Sentinel/2.0", accept: "application/json,text/html" } });
      httpStatus = response.status;
      const body = await readBounded(response);
      ok = Boolean(probe.check(response, body));
    } catch { /* Never store remote response bodies, OAuth state/cookies, IPs or stack traces. */ }
    return { id: probe.id, name: probe.name, ok, httpStatus, latencyMs: Date.now() - started };
  }));
}
