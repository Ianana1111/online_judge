/* ---------- 觀念動畫（第 5～8 章） ---------- */

// 第 5 章：else if 由上往下檢查；可以拖動分數、切換「順序放錯」
import { cellRow, defineAnim } from "./anim-core.js";
import { $, esc } from "./util.js";

(function () {
  const RIGHT = [[90, "A"], [80, "B"], [70, "C"], [60, "D"]], WRONG = [[60, "D"], [70, "C"], [80, "B"], [90, "A"]];
  function build(score, wrong) {
    const conds = wrong ? WRONG : RIGHT, steps = [];
    steps.push({ text: `score = ${score}。從**第一個**條件開始，由上往下檢查。`, s: { score, conds, at: -1, hit: -1 } });
    for (let i = 0; i < conds.length; i++) {
      const ok = score >= conds[i][0];
      steps.push({ text: ok ? `${score} >= ${conds[i][0]} 成立，印出 ${conds[i][1]}，**後面的條件全部跳過**。` +
        (wrong && conds[i][1] !== (RIGHT.find((c) => score >= c[0]) || [0, "F"])[1] ? "結果錯了！大範圍的條件放在前面，會把後面的情況吃掉。" : "")
        : `${score} >= ${conds[i][0]} 不成立，往下一個 else if。`, s: { score, conds, at: i, hit: ok ? i : -1 } });
      if (ok) return steps;
    }
    steps.push({ text: "上面全部不成立，執行最後的 else，印出 F。", s: { score, conds, at: conds.length, hit: conds.length } });
    return steps;
  }
  defineAnim("else-if-flow", {
    title: "else if：第一個成立的就停",
    build: () => build(85, false),
    setup(api) {
      let score = 85, wrong = false;
      api.extra.innerHTML = '<label>score = <b>85</b> <input type="range" min="0" max="100" value="85" aria-label="分數"></label>' +
        '<button class="btn">切換成：順序放錯的版本</button>';
      const r = $("input", api.extra), b = $("button", api.extra), lab = $("b", api.extra);
      r.addEventListener("input", () => { score = +r.value; lab.textContent = score; api.rebuild(build(score, wrong)); });
      b.addEventListener("click", () => {
        wrong = !wrong;
        b.textContent = wrong ? "切換成：正確的順序" : "切換成：順序放錯的版本";
        api.rebuild(build(score, wrong));
      });
    },
    render(s) {
      const rows = s.conds.map((c, i) => `<div class="an-box ${s.hit === i ? "ok hot" : i === s.at ? "bad" : i < s.at ? "dim" : ""}">` +
        `<small>${i === 0 ? "if" : "else if"} (score >= ${c[0]})</small><b>印出 ${c[1]}</b></div>`);
      rows.push(`<div class="an-box ${s.hit === s.conds.length ? "ok hot" : ""}"><small>else</small><b>印出 F</b></div>`);
      return `<div class="an-flex">${rows.join('<div class="an-arrow">→</div>')}</div>`;
    },
  });
})();

// 第 6 章：for 的四個部分，依 ①②③④②③④… 的順序執行
(function () {
  const steps = [];
  let k = 0, out = "";
  const push = (part, text) => steps.push({ text, s: { part, k, out } });
  push(1, "① **初始化**：`int k = 0`，整個迴圈只做這一次。");
  for (;;) {
    if (k < 3) push(2, `② **檢查條件**：${k} < 3 成立，進入本體。`);
    else { push(2, `② **檢查條件**：${k} < 3 不成立，離開迴圈。本體一共跑了 3 次。`); break; }
    out += k + " ";
    push(3, `③ **本體**：印出 ${k}。`);
    k++;
    push(4, `④ **更新**：\`k++\`，k 變成 ${k}。然後回到 ②。`);
  }
  defineAnim("for-order", {
    title: "for 迴圈的執行順序",
    speed: 1300,
    steps,
    render(s) {
      const parts = ["① int k = 0", "② k < 3", "③ printf(\"%d \", k)", "④ k++"];
      return `<div class="an-flex">${parts.map((t, i) => `<div class="an-box ${s.part === i + 1 ? "hot" : ""}"><b>${esc(t)}</b></div>`).join("")}</div>` +
        `<div class="an-flex"><div class="an-box"><small>k</small><b>${s.k}</b></div><div class="an-box"><small>輸出</small><b>${esc(s.out) || "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 6 章：外層像時針、內層像分針；第 i 列印 i 顆星
(function () {
  const n = 4, steps = [{ text: "外層 i 決定「第幾列」，內層 j 決定「這一列的第幾顆」。外層走一格，內層要從頭走完一輪。", s: { i: 0, j: 0, rows: [] } }];
  const rows = [];
  for (let i = 1; i <= n; i++) {
    rows.push("");
    for (let j = 1; j <= i; j++) {
      rows[i - 1] += "*";
      steps.push({ text: `i = ${i}，j = ${j}：印一顆星。${j === i ? `j 已經到 i 了，內層結束。` : ""}`, s: { i, j, rows: rows.slice() } });
    }
    steps.push({ text: `第 ${i} 列印完 ${i} 顆，換行，外層 i 前進到 ${i + 1}。${i === n ? "i 超過 n，全部結束。" : ""}`, s: { i, j: 0, rows: rows.slice(), nl: true } });
  }
  defineAnim("nested-clock", {
    title: "巢狀迴圈：外層一圈，內層一整輪",
    speed: 900,
    steps,
    render(s) {
      const grid = s.rows.map((r, k) => cellRow(r.split("").map((c, j) => ({ v: c, cls: k === s.i - 1 && j === s.j - 1 ? "hot" : "" })), `第 ${k + 1} 列`)).join("");
      return `<div class="an-flex"><div class="an-box ${s.nl ? "hot" : ""}"><small>外層 i（時針）</small><b>${s.i || "-"}</b></div>` +
        `<div class="an-box ${s.j && !s.nl ? "hot" : ""}"><small>內層 j（分針）</small><b>${s.j || "-"}</b></div></div>${grid}`;
    },
  });
})();

// 第 7 章：a[i] 的位址 = 開頭位址 + i × 4；i 超出範圍就指到別人的資料
(function () {
  const steps = [];
  for (let i = 0; i <= 6; i++) {
    const addr = 200 + i * 4;
    steps.push({
      text: i < 5 ? `\`&a[${i}]\` = 200 + ${i} × 4 = ${addr}：電腦直接用乘法算出位置，所以存取任何一格都一樣快。`
        : `i = ${i}：200 + ${i} × 4 = ${addr} 已經超出陣列（a 只有 a[0] ~ a[4]）。C **不會**幫你檢查，會直接讀寫到別的資料！`,
      s: { i, addr },
    });
  }
  defineAnim("array-address", {
    title: "陣列的位址怎麼算",
    steps,
    setup(api) {
      api.extra.innerHTML = '<label>i = <b>0</b> <input type="range" min="0" max="6" value="0" aria-label="索引 i"></label>';
      const r = $("input", api.extra), lab = $("b", api.extra);
      r.addEventListener("input", () => { lab.textContent = r.value; api.show(+r.value); });
    },
    render(s) {
      const vals = [10, 20, 30, 40, 50, "別的資料", "別的資料"];
      const cells = vals.map((v, k) => ({ v, top: k === s.i ? "▼" : k < 5 ? `a[${k}]` : "", bot: 200 + k * 4,
        cls: k === s.i ? (k < 5 ? "hot" : "bad") : k >= 5 ? "dim" : "" }));
      return cellRow(cells, "int a[5]") + `<div class="an-flex"><div class="an-box ${s.i >= 5 ? "bad" : "hot"}"><small>&a[${s.i}]</small><b>200 + ${s.i} × 4 = ${s.addr}</b></div></div>`;
    },
  });
})();

// 第 7 章：1-P5 Jolly Jumper 的打勾表
(function () {
  function run(seq, steps) {
    const n = seq.length, seen = Array(n).fill(false);
    steps.push({ text: `序列 ${seq.join(" ")}（n = ${n}）。相鄰差的絕對值要剛好是 1 ~ ${n - 1} 各一次。seen[] 一開始全部是 false。`, s: { seq, seen: seen.slice(), i: 0, d: null } });
    for (let i = 1; i < n; i++) {
      const d = Math.abs(seq[i] - seq[i - 1]);
      if (d < 1 || d > n - 1 || seen[d]) {
        steps.push({ text: `|${seq[i]} − ${seq[i - 1]}| = ${d}：${seen[d] ? `seen[${d}] 已經打過勾，**重複了**` : "超出 1 ~ n−1 的範圍"} → Not jolly。`, s: { seq, seen: seen.slice(), i, d, bad: true } });
        return;
      }
      seen[d] = true;
      steps.push({ text: `|${seq[i]} − ${seq[i - 1]}| = ${d}：在 seen[${d}] 打勾。`, s: { seq, seen: seen.slice(), i, d } });
    }
    steps.push({ text: "每個差都沒有重複、也都在範圍內 → Jolly！", s: { seq, seen: seen.slice(), i: n, d: null, ok: true } });
  }
  const steps = [];
  run([1, 4, 2, 3], steps);
  run([1, 4, 2, -1, 6], steps);
  defineAnim("tally-table", {
    title: "打勾表：把「值」當成「索引」",
    steps,
    render(s) {
      const seq = s.seq.map((v, k) => ({ v, cls: s.i > 0 && s.i < s.seq.length && (k === s.i || k === s.i - 1) ? "hot" : "" }));
      const seen = s.seen.map((v, k) => ({ v: k === 0 ? "" : v ? "✓" : "", top: `[${k}]`, cls: k === 0 ? "dim" : k === s.d ? (s.bad ? "bad" : "hot") : v ? "ok" : "" }));
      return cellRow(seq, "序列") + (s.d !== null ? `<div class="an-flex"><div class="an-box ${s.bad ? "bad" : "hot"}"><small>相鄰差 d</small><b>${s.d}</b></div></div>` : "") +
        cellRow(seen, "seen[]") + (s.ok ? '<div class="an-flex"><div class="an-box ok"><b>Jolly</b></div></div>' : s.bad ? '<div class="an-flex"><div class="an-box bad"><b>Not jolly</b></div></div>' : "");
    },
  });
})();

// 第 8 章：二維陣列在記憶體裡一列接一列；點表格的格子看它在第幾格
(function () {
  const steps = [{ text: "`int a[3][3]` 看起來是表格，但記憶體只有一條直線：先放第 0 列，再放第 1 列、第 2 列。點表格裡的格子試試看。", s: { i: -1, j: -1 } }];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) steps.push({ text: `\`a[${i}][${j}]\` 在攤平後的第 **${i} × 3 + ${j} = ${i * 3 + j}** 格（每列 3 格，前面有 ${i} 整列）。`, s: { i, j } });
  }
  defineAnim("row-major", {
    title: "二維陣列：一列接著一列（row-major）",
    steps,
    setup(api) {
      api.stage.addEventListener("click", (e) => {
        const b = e.target.closest("[data-ij]");
        if (b) api.show(+b.dataset.ij + 1);
      });
    },
    render(s) {
      let t = '<table class="pa"><thead><tr><th></th><th>[0]</th><th>[1]</th><th>[2]</th></tr></thead><tbody>';
      for (let i = 0; i < 3; i++) {
        t += `<tr><th>[${i}]</th>`;
        for (let j = 0; j < 3; j++) {
          t += `<td class="${i === s.i && j === s.j ? "chg" : ""}"><button class="lnk" data-ij="${i * 3 + j}" aria-label="a[${i}][${j}]">${i * 3 + j + 1}</button></td>`;
        }
        t += "</tr>";
      }
      t += "</tbody></table>";
      const k = s.i * 3 + s.j;
      const flat = Array.from({ length: 9 }, (_, x) => ({ v: x + 1, top: `[${Math.floor(x / 3)}][${x % 3}]`, bot: x, cls: x === k ? "hot" : "" }));
      return `<div class="an-flex"><div><div class="an-note">程式裡看到的樣子</div>${t}</div></div>` + cellRow(flat, "記憶體");
    },
  });
})();

// 第 8 章：1-P1 魔方陣，往左上填，撞到就往下，超出邊界就繞到另一邊
(function () {
  const n = 3, sq = Array.from({ length: n }, () => Array(n).fill(0)), steps = [];
  let row = 0, col = Math.floor(n / 2), why = "1 放在第一列的正中間。";
  for (let k = 1; k <= n * n; k++) {
    sq[row][col] = k;
    steps.push({ text: `放 ${k}：${why}`, s: { sq: sq.map((r) => r.slice()), row, col } });
    let r = row - 1, c = col - 1;
    const wraps = [];
    if (r < 0) { r = n - 1; wraps.push("超出上邊界，繞到最下面一列"); }
    if (c < 0) { c = n - 1; wraps.push("超出左邊界，繞到最右邊一行"); }
    if (sq[r][c] !== 0) {
      why = `左上（第 ${r} 列第 ${c} 行）已經有 ${sq[r][c]} 了，改放在原本位置的**正下方**。`;
      r = row + 1; c = col;
      if (r === n) { r = 0; why += "下面超出邊界，繞到第一列。"; }
    } else why = "往**左上**一格" + (wraps.length ? `（${wraps.join("、")}）` : "") + "。";
    row = r; col = c;
  }
  steps.push({ text: "填完了！每一列、每一行、兩條對角線的總和都是 n(n² + 1) / 2 = 15。", s: { sq: sq.map((r) => r.slice()), row: -1, col: -1 } });
  defineAnim("magic-square", {
    title: "魔方陣的填法（1-P1）",
    steps,
    render(s) {
      return s.sq.map((r, i) => cellRow(r.map((v, j) => ({ v: v || "", cls: i === s.row && j === s.col ? "hot" : v ? "" : "blank" })), `第 ${i} 列`)).join("");
    },
  });
})();
