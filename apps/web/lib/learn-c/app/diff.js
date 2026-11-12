/* ---------- 比對輸出：練習用的規則比 OJ 寬鬆（忽略行尾空白、結尾多的空行），但要說清楚差在哪 ---------- */
import { esc } from "./util.js";

export const normOut = (s) => s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n").replace(/\n+$/, "");
export const charName = (c) => (c === undefined ? "（這一行已經結束）" : c === " " ? "空白" : c === "\t" ? "Tab" : `「${c}」`);
export const showWs = (s) => esc(s).replace(/ /g, '<span class="ws">·</span>').replace(/\t/g, '<span class="ws">→</span>');

export function compareOut(got, want) {
  const pass = normOut(got) === normOut(want);
  const exact = got === want;
  if (pass) {
    let note = "";
    if (!exact) {
      const gl = got.split("\n"), wl = want.split("\n");
      if (gl.some((l, i) => /[ \t]$/.test(l) && l.trimEnd() === (wl[i] || "").trimEnd())) note = "你的輸出有些行的結尾多了空白";
      else if (!got.endsWith("\n") && want.endsWith("\n")) note = "你的輸出最後少了換行 \\n";
      else note = "你的輸出結尾多了空行";
      note += "。這裡的練習會放過，但正式的 OJ（例如 judge.tw）會逐字比對，可能會判錯。";
    }
    return { pass, exact, note };
  }
  const g = normOut(got).split("\n"), w = normOut(want).split("\n");
  let i = 0;
  while (i < g.length && i < w.length && g[i] === w[i]) i++;
  let msg, col = -1;
  if (normOut(got) === "") msg = "你的程式沒有印出任何東西";
  else if (i >= g.length) msg = `你的輸出少了東西：正確答案還有 ${w.length - g.length} 行（從第 ${i + 1} 行開始）`;
  else if (i >= w.length) msg = `你多印了 ${g.length - w.length} 行（從第 ${i + 1} 行開始）`;
  else {
    const a = g[i], b = w[i];
    col = 0;
    while (col < a.length && col < b.length && a[col] === b[col]) col++;
    if (col >= a.length) msg = `第 ${i + 1} 行少了後面的「${b.slice(col)}」`;
    else if (col >= b.length) msg = `第 ${i + 1} 行多印了「${a.slice(col)}」`;
    else msg = `第 ${i + 1} 行第 ${col + 1} 個字元不一樣：你印的是${charName(a[col])}，正確的是${charName(b[col])}`;
    if (a.replace(/\s+/g, " ") === b.replace(/\s+/g, " ")) msg += "（只差在空白的數量）";
    else if (a.toLowerCase() === b.toLowerCase()) msg += "（只差在大小寫）";
  }
  return { pass, exact, msg, line: i, col, got: g, want: w };
}

// 並排顯示「你的輸出」和「正確輸出」，標出第一個不同的行和字元
export function renderDiff(d) {
  const side = (lines, other, title) => {
    const rows = lines.map((l, k) => {
      let body = showWs(l);
      if (k === d.line && d.col >= 0) body = showWs(l.slice(0, d.col)) + `<mark>${showWs(l.slice(d.col, d.col + 1)) || "&nbsp;"}</mark>` + showWs(l.slice(d.col + 1));
      return `<div class="dl${k === d.line ? " bad" : ""}"><span class="dn">${k + 1}</span><span>${body || "&nbsp;"}</span></div>`;
    }).join("");
    return `<div class="dside"><div class="dtitle">${title}</div><div class="dbody">${rows || '<div class="dl empty">（沒有輸出）</div>'}</div></div>`;
  };
  return `<div class="diff">${side(d.got, d.want, "你的輸出")}${side(d.want, d.got, "正確輸出")}</div>`;
}
