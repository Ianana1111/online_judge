// 執行 C 程式的 Web Worker（由 Next.js 打包；runner.js 用 new Worker(new URL("../interp/worker.js", import.meta.url)) 建立）。
// 解譯器由 load.js 依序載入（每個檔案都會把自己掛到 globalThis.CInterpParts）。
import "./load.js";

self.onmessage = (e) => {
  const d = e.data;
  let r;
  try {
    r = self.CInterp.run(d.src, d.opts);
  } catch (err) {
    r = { status: "runtime", out: "", exitCode: 0, warnings: [], steps: 0, trace: null,
      error: { line: 0, msg: "練習環境內部發生錯誤（不是你的程式的問題）：" + (err && err.message) } };
  }
  self.postMessage({ id: d.id, r });
};
