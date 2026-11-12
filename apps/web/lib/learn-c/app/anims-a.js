/* ---------- 觀念動畫（第 1～4 章） ---------- */

// 第 1 章：.c → gcc → 執行檔 → 輸出；可以切換成「少了分號」的版本
import { cellRow, codeLines, defineAnim, vis } from "./anim-core.js";
import { el, esc } from "./util.js";

(function () {
  const good = 'int main() {\n    printf("Hi\\n");\n    return 0;\n}';
  const bad = 'int main() {\n    printf("Hi\\n")\n    return 0;\n}';
  const steps = (isBad) => (isBad ? [
    { text: "這是少了分號的 hello.c。程式碼只是一個文字檔，電腦還不能直接執行它。", s: { bad: true, at: 0 } },
    { text: "gcc 一行一行檢查語法，發現**第 2 行結尾少了分號**，回報編譯錯誤。", s: { bad: true, at: 1 } },
    { text: "編譯失敗就**不會產生執行檔**，程式根本沒有執行，所以也不會有任何輸出。先把錯誤修好再編譯一次。", s: { bad: true, at: 2 } },
  ] : [
    { text: "這是你寫的 hello.c。程式碼只是一個文字檔，電腦還不能直接執行它。", s: { bad: false, at: 0 } },
    { text: "gcc（編譯器）把 C 程式翻譯成電腦看得懂的機器指令，這一步叫做**編譯**。", s: { bad: false, at: 1 } },
    { text: "編譯成功，產生**執行檔**（例如 a.out）。", s: { bad: false, at: 2 } },
    { text: "執行 a.out：程式從 main 開始跑，printf 把文字印到螢幕上。", s: { bad: false, at: 3 } },
  ]);
  defineAnim("compile-pipeline", {
    title: "從程式碼到執行：編譯",
    build: () => steps(false),
    setup(api) {
      let isBad = false;
      const b = el("button", "btn", "切換成：少了分號的版本");
      b.addEventListener("click", () => {
        isBad = !isBad;
        b.textContent = isBad ? "切換成：正確的版本" : "切換成：少了分號的版本";
        api.rebuild(steps(isBad));
      });
      api.extra.appendChild(b);
    },
    render(s) {
      const cls = (k) => (s.at === k ? "hot" : s.at < k ? "dim" : "");
      const gccCls = s.bad && s.at >= 1 ? "bad" : cls(1);
      const after = (k) => (s.bad ? "dim" : cls(k));
      return '<div class="an-flex">' +
        `<div class="an-box ${cls(0)}"><small>hello.c（程式碼）</small>${codeLines(s.bad ? bad : good, s.bad && s.at >= 1 ? 2 : 0)}</div>` +
        `<div class="an-arrow${s.at >= 1 ? " on" : ""}">→</div>` +
        `<div class="an-box ${gccCls}"><small>gcc 編譯器</small><b>${s.bad && s.at >= 1 ? "第 2 行：少了 ;" : "翻譯成機器指令"}</b></div>` +
        `<div class="an-arrow${s.at >= 2 && !s.bad ? " on" : ""}">→</div>` +
        `<div class="an-box ${after(2)}"><small>執行檔</small><b>${s.bad && s.at >= 2 ? "沒有產生" : "a.out"}</b></div>` +
        `<div class="an-arrow${s.at >= 3 ? " on" : ""}">→</div>` +
        `<div class="an-box ${after(3)}"><small>螢幕（輸出）</small><b>${s.at >= 3 ? "Hi" : "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 2 章：宣告變數 = 在記憶體裡占幾格；x = x + 1 是「讀 → 算 → 寫回」
(function () {
  const C = { name: "c", type: "char", size: 1, addr: 100 };
  const X = { name: "x", type: "int", size: 4, addr: 104 };
  const Y = { name: "y", type: "long long", size: 8, addr: 112 };
  const st = (vars, hot, cpu, vals) => ({ vars, hot, cpu, vals: vals || {} });
  defineAnim("memory-boxes", {
    title: "變數在記憶體裡占幾格",
    steps: [
      { text: "記憶體就像一排置物櫃，每一格是 1 個 byte，每格都有編號（位址）。", s: st([], "", "") },
      { text: "`char c;`：char 占 **1** 格。", s: st([C], "c", "") },
      { text: "`int x;`：int 占 **4** 格，可以放大約 ±21 億。", s: st([C, X], "x", "") },
      { text: "`long long y;`：long long 占 **8** 格，可以放大約 ±9.2 × 10¹⁸。", s: st([C, X, Y], "y", "") },
      { text: "`x = 5;`：把 5 放進 x 的格子。", s: st([C, X, Y], "x", "", { x: 5 }) },
      { text: "`x = x + 1;` 第一步：**先讀**出 x 現在的值 5，拿到計算區。", s: st([C, X, Y], "x", "讀出 x → 5", { x: 5 }) },
      { text: "第二步：在計算區**算出** 5 + 1 = 6。這時候 x 的格子還是 5。", s: st([C, X, Y], "", "5 + 1 = 6", { x: 5 }) },
      { text: "第三步：把 6 **寫回** x 的格子。所以 `=` 是「把右邊算好的值放進左邊」，不是數學的等於。", s: st([C, X, Y], "x", "寫回 x ← 6", { x: 6 }) },
    ],
    render(s) {
      const boxes = s.vars.map((v) => {
        const cells = Array.from({ length: v.size }, (_, i) => ({ v: i === 0 && s.vals[v.name] !== undefined ? s.vals[v.name] : "", top: v.addr + i,
          cls: s.vals[v.name] === undefined ? "dim" : "" }));
        return `<div class="an-box ${s.hot === v.name ? "hot" : ""}"><small>${v.type} ${v.name}（${v.size} byte${v.size > 1 ? "s" : ""}）</small>${cellRow(cells)}</div>`;
      }).join("");
      return `<div class="an-flex">${boxes || '<div class="an-note">（還沒有宣告任何變數）</div>'}</div>` +
        (s.cpu ? `<div class="an-flex"><div class="an-box hot"><small>計算區（CPU）</small><b>${esc(s.cpu)}</b></div></div>` : "");
    },
  });
})();

// 第 2 章：int 溢位像里程表；32 個 bit 一起看
(function () {
  const bits = (v, prev) => {
    const b = (v >>> 0).toString(2).padStart(32, "0"), p = prev === undefined ? b : (prev >>> 0).toString(2).padStart(32, "0");
    return '<div class="an-bits">' + b.split("").map((c, i) => `<span class="${i === 0 ? "sign" : ""}${c !== p[i] ? " flip" : ""}">${c}</span>`).join("") + "</div>";
  };
  defineAnim("int-overflow", {
    title: "int 溢位：超過最大值會繞回最小值",
    steps: [
      { text: "int 有 32 個 bit。最左邊那一個（藍色）是**正負號**：0 代表正數。", s: { v: 2147483646 } },
      { text: "再加 1，變成 int 能放的**最大值** 2147483647（INT_MAX）：後面 31 個 bit 全是 1。", s: { v: 2147483647 } },
      { text: "再加 1：每一位都進位，正負號那一位變成 1，結果繞回**最小值** −2147483648。電腦不會警告你！", s: { v: -2147483648 } },
      { text: "常見的情況：`int k = 50000;` 再算 `k * k`。正確答案 25 億超過 INT_MAX，兩個 int 相乘的結果還是 int，所以溢位了。", s: { mul: true, show: 1 } },
      { text: "解法：先把其中一個轉成 long long：`(long long)k * k`，整個乘法就用 64 位元計算，答案正確。", s: { mul: true, show: 2 } },
    ],
    render(s, prev) {
      if (s.mul) {
        return '<div class="an-flex">' +
          `<div class="an-box bad"><small>int * int（還是 int）</small><b>k * k = ${Math.imul(50000, 50000)}</b></div>` +
          `<div class="an-box ${s.show === 2 ? "ok hot" : "dim"}"><small>(long long)k * k</small><b>${s.show === 2 ? "2500000000" : "?"}</b></div></div>`;
      }
      return `<div class="an-big">${s.v}</div>${bits(s.v, prev && !prev.mul ? prev.v : undefined)}` +
        `<p class="an-note">INT_MAX = 2147483647、INT_MIN = −2147483648</p>`;
    },
  });
})();

// 第 3 章：scanf 怎麼從輸入緩衝區拿資料；%c 會讀到換行的陷阱
(function () {
  const A = 'int a, b, r;\nr = scanf("%d %d", &a, &b);\nr = scanf("%d", &a);';
  const B = 'int n;\nchar c;\nscanf("%d", &n);\nscanf("%c", &c);';
  const s = (inp, pos, vars, code, hot, extra) => Object.assign({ inp, pos, vars, code, hot }, extra || {});
  defineAnim("scanf-buffer", {
    title: "scanf 怎麼讀輸入",
    speed: 1800,
    steps: [
      { text: "你打的輸入會先放在**輸入緩衝區**，scanf 從游標的位置開始拿。␣ 是空白，↵ 是換行。", s: s("12 7\n", 0, {}, A, 2) },
      { text: "`%d`：讀數字 1、2，遇到空白就停下來，把 12 放進 a。", s: s("12 7\n", 2, { a: 12 }, A, 2) },
      { text: "格式裡的空白：跳過輸入裡所有的空白。", s: s("12 7\n", 3, { a: 12 }, A, 2) },
      { text: "第二個 `%d` 讀到 7，放進 b。", s: s("12 7\n", 4, { a: 12, b: 7 }, A, 2) },
      { text: "成功讀了 2 個值，所以 scanf **回傳 2**。", s: s("12 7\n", 4, { a: 12, b: 7, r: 2 }, A, 2) },
      { text: "下一次 scanf：`%d` 會先跳過空白（包含換行 ↵）……然後就沒有東西了。", s: s("12 7\n", 5, { a: 12, b: 7, r: 2 }, A, 3) },
      { text: "一個值都沒讀到就遇到結尾，scanf **回傳 EOF（−1）**。`while (scanf(…) != EOF)` 就是靠這個停下來的。", s: s("12 7\n", 5, { a: 12, b: 7, r: -1 }, A, 3) },
      { text: "陷阱：輸入是 5↵A↵。先用 `%d` 讀 n。", s: s("5\nA\n", 0, {}, B, 3) },
      { text: "`%d` 讀走 5，但後面的換行 ↵ 還留在緩衝區裡。", s: s("5\nA\n", 1, { n: 5 }, B, 3) },
      { text: "`%c` **不會跳過空白**：它讀到的是換行 ↵（ASCII 10），不是 A！", s: s("5\nA\n", 2, { n: 5, c: "'\\n'" }, B, 4, { bad: true }) },
      { text: "解法：寫成 `scanf(\" %c\", &c)`，%c 前面加一個空白，就會先跳過換行，讀到 A。", s: s("5\nA\n", 3, { n: 5, c: "'A'" }, 'int n;\nchar c;\nscanf("%d", &n);\nscanf(" %c", &c);', 4) },
    ],
    render(st) {
      const cells = st.inp.split("").map((ch, i) => ({ v: vis(ch), top: i === st.pos ? "▼" : "", cls: i < st.pos ? "dim" : i === st.pos ? "hot" : "" }));
      cells.push({ v: "結尾", top: st.pos >= st.inp.length ? "▼" : "", cls: "blank" });
      const vars = Object.entries(st.vars).map(([k, v]) => `<div class="an-box ${st.bad && k === "c" ? "bad" : ""}"><small>${k === "r" ? "回傳值 r" : k}</small><b>${esc(v)}</b></div>`).join("");
      return codeLines(st.code, st.hot) + cellRow(cells, "輸入緩衝區") + `<div class="an-flex">${vars}</div>`;
    },
  });
})();

// 第 3 章：printf 由左往右，遇到 % 就拿下一個參數來填
(function () {
  const toks = [{ t: "x = " }, { t: "%d", arg: 0 }, { t: ", y = " }, { t: "%5d", arg: 1 }, { t: "\\n" }];
  const outs = ["", "x = ", "x = 3", "x = 3, y = ", "x = 3, y =    42", "x = 3, y =    42"];
  const texts = [
    "`printf(\"x = %d, y = %5d\\n\", x, y);`，x 是 3、y 是 42。printf 從格式字串的最左邊開始處理。",
    "一般的文字照抄到輸出。",
    "遇到 `%d`：拿**第一個參數** x，用十進位整數印出 3。",
    "繼續照抄文字 `, y = `。",
    "`%5d`：拿**下一個參數** y，而且至少占 **5 格**寬；42 只有 2 位，所以前面補 3 個空白（靠右對齊）。",
    "`\\n` 是換行，這一行印完了。% 的個數要和後面參數的個數一樣，型態也要對上。",
  ];
  defineAnim("printf-format", {
    title: "printf 的格式字串",
    steps: texts.map((text, k) => ({ text, s: { k } })),
    render(s) {
      const fmt = toks.map((x, i) => `<span class="an-cell ${i === s.k - 1 ? "hot" : i < s.k - 1 ? "dim" : ""}">${esc(x.t)}</span>`).join("");
      const used = (a) => toks.findIndex((x) => x.arg === a) < s.k - 1;
      const args = [["x", 3], ["y", 42]].map(([n, v], a) => `<div class="an-box ${toks[s.k - 1] && toks[s.k - 1].arg === a ? "hot" : used(a) ? "dim" : ""}"><small>第 ${a + 2} 個參數</small><b>${n} = ${v}</b></div>`).join("");
      const out = outs[s.k].split("").map((c, i) => ({ v: vis(c), cls: s.k === 4 && i >= 11 && i < 14 ? "hot" : "" }));
      return `<div class="an-row"><div class="an-lab">格式</div><div class="an-cells">${fmt}</div></div><div class="an-flex">${args}</div>` +
        (out.length ? cellRow(out, "輸出") : '<div class="an-note">輸出：（還沒有）</div>');
    },
  });
})();

// 第 4 章：/ 是「分成幾組」、% 是「剩下幾個」
(function () {
  const st = (n, k, grouped, hl) => ({ n, k, grouped, hl });
  defineAnim("div-mod", {
    title: "整數除法 / 和取餘數 %",
    steps: [
      { text: "有 17 個點。", s: st(17, 5, false, "") },
      { text: "每 5 個分成一組。", s: st(17, 5, true, "") },
      { text: "`17 / 5` 問的是「**可以分成幾組**」：3 組（小數部分直接丟掉）。", s: st(17, 5, true, "div") },
      { text: "`17 % 5` 問的是「**分完之後剩下幾個**」：2 個。永遠會有 `17 == 17 / 5 * 5 + 17 % 5`。", s: st(17, 5, true, "mod") },
      { text: "0-P5 Cola：手上 8 個空瓶，3 個空瓶換 1 瓶。", s: st(8, 3, true, "") },
      { text: "`8 / 3 = 2`：可以換 2 瓶；`8 % 3 = 2`：換完還剩 2 個空瓶。", s: st(8, 3, true, "both") },
    ],
    render(s) {
      const full = s.grouped ? Math.floor(s.n / s.k) : 0, rest = s.grouped ? s.n % s.k : s.n;
      const dots = (m) => '<span class="an-dot"></span>'.repeat(m);
      let h = '<div class="an-dots">';
      for (let g = 0; g < full; g++) h += `<div class="an-group full">${dots(s.k)}</div>`;
      if (rest) h += `<div class="an-group ${s.grouped ? "rest" : ""}">${dots(rest)}</div>`;
      h += "</div>";
      if (s.grouped) {
        h += '<div class="an-flex">' +
          `<div class="an-box ${s.hl === "div" || s.hl === "both" ? "hot" : ""}"><small>${s.n} / ${s.k}（幾組）</small><b>${full}</b></div>` +
          `<div class="an-box ${s.hl === "mod" || s.hl === "both" ? "hot" : ""}"><small>${s.n} % ${s.k}（剩幾個）</small><b>${s.n % s.k}</b></div></div>`;
      }
      return h;
    },
  });
})();

// 第 4 章：%10 拿到個位數、/10 把個位數丟掉
(function () {
  const steps = [{ text: "要把 4096 的每一位拆出來。重複做兩件事：`d = n % 10` 拿到個位數，`n = n / 10` 把個位數丟掉。", s: { n: 4096, digits: [], d: null } }];
  let n = 4096;
  const digits = [];
  while (n > 0) {
    const d = n % 10;
    steps.push({ text: `\`${n} % 10 = ${d}\`：拿到個位數 ${d}。`, s: { n, digits: digits.slice(), d } });
    digits.push(d);
    steps.push({ text: `\`${n} / 10 = ${Math.floor(n / 10)}\`：把個位數丟掉。${Math.floor(n / 10) === 0 ? "n 變成 0，迴圈 `while (n > 0)` 停下來。" : ""}`, s: { n: Math.floor(n / 10), digits: digits.slice(), d: null } });
    n = Math.floor(n / 10);
  }
  steps.push({ text: "拆出來的順序是 **6、9、0、4**：從個位數開始。要正著印，就先存進陣列再倒著印（1-P3 Parity、1-P7 也是這樣）。", s: { n: 0, digits: digits.slice(), d: null, done: true } });
  defineAnim("digit-split", {
    title: "拆出每一位數",
    steps,
    render(s) {
      const num = String(s.n).split("").map((c, i, a) => ({ v: c, cls: s.d !== null && i === a.length - 1 ? "hot" : "" }));
      return '<div class="an-flex">' +
        `<div class="an-box"><small>n</small>${cellRow(num)}</div>` +
        `<div class="an-box ${s.d !== null ? "hot" : ""}"><small>d = n % 10</small><b>${s.d === null ? "&nbsp;" : s.d}</b></div></div>` +
        cellRow(s.digits.map((d, i) => ({ v: d, top: `第 ${i + 1} 個`, cls: s.done ? "ok" : "" })), "拆出來的");
    },
  });
})();

// 第 4 章：&& 左邊是假，右邊就不算（短路求值）
(function () {
  const st = (x, left, right, result) => ({ x, left, right, result });
  defineAnim("short-circuit", {
    title: "短路求值：&& 左邊是假就不看右邊",
    steps: [
      { text: "`if (x > 0 && 10 / x > 2)`，先看 x = 0 的情況。", s: st(0, "", "", "") },
      { text: "先算左邊 `x > 0`：0 > 0 是**假**。", s: st(0, "false", "", "") },
      { text: "&& 只要有一邊是假，整個就是假，所以**右邊整個不算**。也因為這樣，`10 / x` 不會執行，不會除以 0 出錯。", s: st(0, "false", "skip", "false") },
      { text: "換成 x = 4。左邊 `4 > 0` 是**真**，這時候才需要看右邊。", s: st(4, "true", "", "") },
      { text: "右邊 `10 / 4 > 2`：整數除法 10 / 4 = 2，2 > 2 是**假**。", s: st(4, "true", "false", "") },
      { text: "左真、右假，&& 的結果是假。所以把「保護條件」寫在 && 的**左邊**，就能避免右邊出錯。|| 也一樣：左邊是真就不看右邊。", s: st(4, "true", "false", "false") },
    ],
    render(s) {
      const cls = (v) => (v === "true" ? "ok" : v === "false" ? "bad" : v === "skip" ? "dim" : "");
      const word = (v) => (v === "true" ? "真" : v === "false" ? "假" : v === "skip" ? "不計算" : "?");
      return `<div class="an-note">x = ${s.x}</div><div class="an-flex">` +
        `<div class="an-box ${cls(s.left)}"><small>左邊：x > 0</small><b>${word(s.left)}</b></div><div class="an-arrow">&&</div>` +
        `<div class="an-box ${cls(s.right)}"><small>右邊：10 / x > 2</small><b>${word(s.right)}</b></div><div class="an-arrow">=</div>` +
        `<div class="an-box ${cls(s.result)}"><small>整個條件</small><b>${word(s.result)}</b></div></div>`;
    },
  });
})();
