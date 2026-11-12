importScripts("interp.js?v=7acff2f3d2");
self.onmessage = function (e) {
  var d = e.data, r;
  try { r = self.CInterp.run(d.src, d.opts); }
  catch (err) { r = { status: "runtime", out: "", exitCode: 0, warnings: [], steps: 0, trace: null, error: { line: 0, msg: "練習環境內部發生錯誤（不是你的程式的問題）：" + (err && err.message) } }; }
  self.postMessage({ id: d.id, r: r });
};
