import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { probeAll } from "./probes.mjs";
import { applyObservation, publicStatus } from "./state.mjs";
import { cloudStorage } from "./storage.mjs";
const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>judge. 服務狀態</title><style>body{background:#090c11;color:#e8ecf2;font:16px system-ui;margin:0}main{max-width:700px;margin:12vh auto;padding:24px}h1{font-size:38px}a{color:#eda936}p{color:#a4acb8;line-height:1.7}.row{display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #29303b}#state{font-size:22px;color:#eda936}.PASS{color:#55d497}.FAIL{color:#ff8282}.CHECKING,.UNKNOWN{color:#edb558}</style><main><a href="https://judge.tw">judge.</a><h1>服務狀態</h1><p id="state">讀取獨立監控中…</p><p id="time"></p><div id="checks"></div><p>每 5 分鐘從 Google Cloud 探測。這是網站連線及指定端點檢查；完整登入、付款與程式評測另由功能巡檢驗證。</p></main><script src="/status.js"></script></html>`;
const statusJs = `const labels={HEALTHY:'目前探測正常',INCIDENT:'偵測到服務異常',CHECKING:'正在確認異常',STALE:'監控資料已過期',UNKNOWN:'尚無監控資料'};async function update(){try{const r=await fetch('/status',{cache:'no-store'}),d=await r.json();document.getElementById('state').textContent=labels[d.status]||'未知';document.getElementById('time').textContent=d.checkedAt?'最後探測：'+new Date(d.checkedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'}):'';const parent=document.getElementById('checks');parent.replaceChildren();for(const c of d.checks){const row=document.createElement('div');row.className='row';const name=document.createElement('span');name.textContent=c.name;const value=document.createElement('span');value.className=c.status;value.textContent={PASS:'正常',FAIL:'異常',CHECKING:'確認中',UNKNOWN:'未知'}[c.status];row.append(name,value);parent.append(row)}}catch{document.getElementById('state').textContent='暫時無法取得監控狀態'}}update();setInterval(update,60000);`;
export function monitorServer({ mode, store, probes = probeAll }) {
  if (!["reader", "writer"].includes(mode)) throw new Error("Explicit monitor mode required");
  return createServer(async (req, res) => {
    const send = (status, body, type = "application/json") => { res.writeHead(status, { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'", "access-control-allow-origin": "https://judge.tw" }); res.end(typeof body === "string" ? body : JSON.stringify(body)); };
    try {
      if (req.method === "GET" && req.url === "/health") return send(200, { status: "ok" });
      if (mode === "reader") {
        if (req.method !== "GET") return send(405, { error: "Method not allowed" });
        if (req.url === "/") return send(200, html, "text/html");
        if (req.url === "/status.js") return send(200, statusJs, "text/javascript");
        if (req.url !== "/status") return send(404, { error: "Not found" });
        const { state } = await store.read(), result = publicStatus(state);
        return send(result.status === "HEALTHY" ? 200 : 503, result);
      }
      // Writer service requires Cloud Run IAM; only the scheduler invoker has access.
      if (req.method !== "POST" || req.url !== "/probe") return send(404, { error: "Not found" });
      const now = new Date(), checks = await probes();
      for (let i = 0; i < 4; i++) {
        const { state, generation } = await store.read(), next = applyObservation(state, checks, now);
        if (next === state || await store.write(next, generation)) return send(200, { ok: true, checkedAt: next.checkedAt });
      }
      return send(409, { error: "Concurrent observation; retry later" });
    } catch { console.error(JSON.stringify({ event: "monitor_request_failed", mode })); return send(503, { status: "UNKNOWN", checkedAt: null, checks: [], incidents: [], history: [] }); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) monitorServer({ mode: process.env.MONITOR_MODE, store: cloudStorage(process.env.MONITOR_BUCKET) }).listen(Number(process.env.PORT ?? 8080), "0.0.0.0");
