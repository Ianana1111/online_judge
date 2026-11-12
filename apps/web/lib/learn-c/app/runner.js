/* ---------- 執行 C 程式（在 Web Worker 裡跑，不會卡住頁面） ---------- */
// runC(src, opts) → Promise<結果>；一次只跑一個，其他的排隊。
// 超過 6 秒（牆鐘時間）就把 Worker 關掉重開；不能建立 Worker 時改在頁面上執行。
export const Runner = (function () {
  const LIMIT_MS = 6000;
  let worker = null, usable = true, busy = null, seq = 0;
  const queue = [];
  let interpLoading = null;

  function makeWorker() {
    try {
      const w = new Worker(new URL("../interp/worker.js", import.meta.url));
      w.onmessage = (e) => {
        if (!busy || e.data.id !== busy.id) return;
        clearTimeout(busy.timer);
        finish(busy, e.data.r);
      };
      w.onerror = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        w.terminate();
        worker = null;
        usable = false;                       // Worker 不能用，之後都在頁面上執行
        if (busy) { const job = busy; busy = null; clearTimeout(job.timer); queue.unshift(job); pump(); }
      };
      return w;
    } catch (e) {
      usable = false;
      return null;
    }
  }
  // 不能用 Worker 時，把解譯器載入到頁面上執行（靠步數上限保護，不會無限執行）
  function loadInterp() {
    if (!interpLoading) interpLoading = import("../interp/load.js");
    return interpLoading;
  }
  function internal(err) {
    return { status: "runtime", out: "", exitCode: 0, warnings: [], steps: 0, trace: null,
      error: { line: 0, msg: "練習環境內部發生錯誤（不是你的程式的問題）：" + (err && err.message) } };
  }
  function finish(job, r) {
    busy = null;
    job.resolve(r);
    pump();
  }
  function pump() {
    if (busy || !queue.length) return;
    const job = queue.shift();
    busy = job;
    job.id = ++seq;
    if (usable && !worker) worker = makeWorker();
    if (!usable || !worker) {
      loadInterp().then(() => {
        let r;
        try { r = window.CInterp.run(job.src, job.opts); } catch (e) { r = internal(e); }
        finish(job, r);
      }, (e) => finish(job, internal(e)));
      return;
    }
    job.timer = setTimeout(() => {
      worker.terminate();
      worker = null;
      finish(job, { status: "limit", out: "", exitCode: 0, warnings: [], steps: 0, trace: null,
        error: { line: 0, msg: "程式執行超過 6 秒還沒結束，可能是無窮迴圈，或是計算量太大" } });
    }, LIMIT_MS);
    worker.postMessage({ id: job.id, src: job.src, opts: job.opts });
  }
  function run(src, opts) {
    return new Promise((resolve) => { queue.push({ src, opts: opts || {}, resolve }); pump(); });
  }
  return { run };
})();
export const runC = Runner.run;
