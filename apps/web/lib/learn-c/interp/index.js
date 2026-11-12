// 對外 API：CInterp.run(source, { input, maxSteps, trace, maxTrace }) → 執行結果。
// 結果只有可以序列化的值（字串、數字），可以直接從 Web Worker 傳回頁面。
(function (CI) {
  'use strict';

  function run(source, opts) {
    opts = opts || {};
    const warnings = [];
    const warn = (line, msg) => warnings.push({ line, msg });
    const res = { status: 'ok', out: '', exitCode: 0, error: null, warnings, steps: 0, trace: null };
    let prog;
    try {
      const lx = CI.lex(String(source), warn);
      prog = CI.check(CI.parse(lx), lx, warnings);
    } catch (e) {
      if (!(e instanceof CI.CErr)) throw e;
      res.status = 'compile';
      res.error = { line: e.line, msg: e.message };
      res.warnings = dedupe(warnings);
      return res;
    }
    res.warnings = dedupe(warnings);
    const ctx = CI.createCtx(opts);
    try {
      res.exitCode = CI.execute(prog, ctx);
    } catch (e) {
      if (e instanceof CI.Exit) res.exitCode = e.code;
      else if (e instanceof CI.RErr) { res.status = 'runtime'; res.error = { line: e.line, msg: e.message }; }
      else if (e instanceof CI.Limit) { res.status = 'limit'; res.error = { line: e.line, msg: e.message }; }
      else if (e instanceof RangeError && /call stack/i.test(e.message)) {
        res.status = 'runtime';
        res.error = { line: ctx.line, msg: '函式呼叫太多層（stack overflow）。遞迴是不是忘了寫終止條件？' };
      } else {
        res.status = 'runtime';
        res.error = { line: 0, msg: '練習環境內部發生錯誤（不是你的程式的問題）：' + (e && e.message) };
        res.internal = String(e && e.stack);
      }
    }
    res.out = CI.decode(ctx.out);
    res.steps = ctx.steps;
    if (ctx.trace) { res.trace = ctx.tr; res.traceCut = ctx.traceCut; }
    return res;
  }

  function dedupe(list) {
    const seen = new Set();
    return list.filter((w) => { const k = w.line + '|' + w.msg; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.line - b.line);
  }

  globalThis.CInterp = { run, version: '1.0.0' };
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));
