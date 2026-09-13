const targets = ["https://judge.tw", "https://api.judge.tw/health"];
let failed = false;
for (const url of targets) {
  let ok = false, status = null;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    try {
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15000) }); status = response.status;
      ok = response.ok && (!url.endsWith("/health") || (await response.json()).status === "ok");
      await response.body?.cancel().catch(() => {});
    } catch { /* Only status and hostname are reported. */ }
    if (!ok && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log(JSON.stringify({ service: new URL(url).hostname, ok, status, checkedAt: new Date().toISOString() }));
  if (!ok) failed = true;
}
if (failed) process.exitCode = 1;
