/* ---------- 觀念動畫（第 9～13 章） ---------- */

// 第 9 章：字元就是整數；'7' - '0' 是 ASCII 表上的距離
import { cellRow, defineAnim } from "./anim-core.js";
import { esc } from "./util.js";

(function () {
  const row = (from, to, hot) => cellRow(Array.from({ length: to - from + 1 }, (_, k) => {
    const c = from + k;
    return { v: String.fromCharCode(c), bot: c, cls: hot.includes(c) ? "hot" : "" };
  }));
  defineAnim("ascii-shift", {
    title: "字元的運算就是 ASCII 碼的運算",
    steps: [
      { text: "每個字元在電腦裡都是一個整數（ASCII 碼）。數字字元 '0' ~ '9' 是 48 ~ 57，而且**連續排在一起**。", s: { part: 0, hot: [] } },
      { text: "`'7' - '0'` 就是 55 − 48 = **7**：兩個字元在表上的距離，剛好就是那個數字的值。", s: { part: 0, hot: [48, 55] } },
      { text: "大寫字母 'A' ~ 'Z' 是 65 ~ 90，小寫 'a' ~ 'z' 是 97 ~ 122。", s: { part: 1, hot: [] } },
      { text: "同一個字母，小寫比大寫多 **32**：'a' − 'A' = 97 − 65 = 32。", s: { part: 1, hot: [65, 97] } },
      { text: "所以小寫轉大寫可以寫 `c - 32`，或更清楚的 `c - 'a' + 'A'`。'g' − 'a' + 'A' = 103 − 97 + 65 = 71 = 'G'。", s: { part: 1, hot: [71, 103] } },
    ],
    render(s) {
      if (s.part === 0) return row(48, 57, s.hot);
      return row(65, 77, s.hot) + row(97, 109, s.hot);
    },
  });
})();

// 第 10 章：strlen 從第 0 格走到 '\0'；strcmp 逐字比較
(function () {
  const cells = ["c", "a", "t", "\\0", "?", "?"];
  const steps = [{ text: "`char s[6] = \"cat\";`：字串後面會自動放一個 '\\0' 當結束記號，再後面的格子沒有用到。", s: { part: 0, i: -1, len: 0 } }];
  for (let i = 0; i <= 3; i++) {
    steps.push({ text: i < 3 ? `s[${i}] 是 '${cells[i]}'，不是 '\\0'，長度 +1 → ${i + 1}。` : "s[3] 是 '\\0'：停下來。長度是 3（'\\0' 不算）。",
      s: { part: 0, i, len: Math.min(i + 1, 3) } });
  }
  const a = "cat", b = "car";
  for (let i = 0; i < 3; i++) {
    const same = a[i] === b[i];
    steps.push({ text: same ? `第 ${i} 個字元都是 '${a[i]}'，一樣，繼續比下一個。`
      : `第 ${i} 個字元不一樣：'${a[i]}'(${a.charCodeAt(i)}) 和 '${b[i]}'(${b.charCodeAt(i)})。't' 比較大，所以 \`strcmp("cat", "car")\` 回傳**正數**。只有完全一樣才回傳 0。`,
    s: { part: 1, i, diff: !same } });
    if (!same) break;
  }
  defineAnim("strlen-scan", {
    title: "strlen 和 strcmp 怎麼走過字串",
    steps,
    render(s) {
      if (s.part === 0) {
        const row = cells.map((c, k) => ({ v: c, top: k === s.i ? "▼" : `[${k}]`, cls: k === s.i ? (k === 3 ? "ok" : "hot") : k > 3 ? "dim" : "" }));
        return cellRow(row, "s") + `<div class="an-flex"><div class="an-box"><small>len</small><b>${s.len}</b></div></div>`;
      }
      const mk = (str) => str.split("").map((c, k) => ({ v: c, cls: k === s.i ? (s.diff ? "bad" : "hot") : k < s.i ? "ok" : "" }));
      return cellRow(mk(a), '"cat"') + cellRow(mk(b), '"car"');
    },
  });
})();

// 第 11 章：呼叫函式時 frame 疊上去、參數是「複製」過去的、return 後 frame 拿掉
(function () {
  const st = (frames, hot, text) => ({ text, s: { frames, hot } });
  const main = (g) => ({ name: "main", vars: `x = 48, y = 18, g = ${g}` });
  defineAnim("call-stack", {
    title: "函式呼叫：call stack",
    steps: [
      st([main("?")], 0, "main 執行到 `int g = gcd(x, y);`。main 的變數放在自己的 frame（一塊記憶體）裡。"),
      st([main("?"), { name: "gcd", vars: "a = 48, b = 18" }], 1, "呼叫 gcd：在 stack 上**疊一個新的 frame**。參數 a、b 是 x、y 的**複本**（傳值呼叫）。"),
      st([main("?"), { name: "gcd", vars: "a = 18, b = 12" }], 1, "gcd 的迴圈改的是自己的 a、b。main 的 x、y 完全沒有變。"),
      st([main("?"), { name: "gcd", vars: "a = 12, b = 6" }], 1, "繼續輾轉相除……"),
      st([main("?"), { name: "gcd", vars: "a = 6, b = 0" }], 1, "b 變成 0，迴圈結束，準備 `return a;`。"),
      st([main(6), { name: "gcd", vars: "回傳 6", gone: true }], 0, "return 之後 gcd 的 frame 就**拿掉**了（裡面的變數也消失），回傳值 6 放進 main 的 g。x、y 還是 48、18。"),
    ],
    render(s) {
      return '<div class="an-stack">' + s.frames.map((f, i) =>
        `<div class="an-frame ${f.gone ? "gone" : i === s.hot ? "hot" : ""}"><b>${f.name}()</b>\u3000${esc(f.vars)}</div>`).join("") +
        '</div><p class="an-note">stack 由下往上疊：最上面是正在執行的函式。</p>';
    },
  });
})();

// 第 11 章：遞迴 gcd 一層層疊上去再回傳；fib 遞迴樹有很多重複計算
(function () {
  const steps = [];
  const calls = [[48, 18], [18, 12], [12, 6], [6, 0]];
  for (let k = 1; k <= calls.length; k++) {
    steps.push({ text: k < calls.length ? `gcd(${calls[k - 1].join(", ")})：b 不是 0，呼叫 gcd(${calls[k].join(", ")})，**再疊一層**。`
      : "gcd(6, 0)：b 是 0，這是**終止條件**，直接回傳 6。", s: { part: 0, n: k, ret: k === calls.length ? 1 : 0 } });
  }
  for (let r = 2; r <= calls.length; r++) steps.push({ text: `回傳 6 給上一層，這一層也就結束了。`, s: { part: 0, n: calls.length, ret: r } });
  const tree = [];
  const walk = (n, d) => { tree.push({ n, d }); if (n >= 2) { walk(n - 1, d + 1); walk(n - 2, d + 1); } };
  walk(4, 0);
  steps.push({ text: "另一個例子：`fib(n) = fib(n-1) + fib(n-2)`。來看 fib(4) 會呼叫哪些函式。", s: { part: 1, shown: 1 } });
  steps.push({ text: "照呼叫的順序展開……", s: { part: 1, shown: 5 } });
  steps.push({ text: `全部展開一共呼叫了 ${tree.length} 次。紅色的是**重複算的**：fib(2) 算了 2 次、fib(1) 算了 3 次。n 越大重複越多，所以這種寫法很慢，要改用陣列預先建表（第 13 章技巧 5）。`, s: { part: 1, shown: tree.length, dup: true } });
  defineAnim("recursion", {
    title: "遞迴：自己呼叫自己",
    steps,
    render(s) {
      if (s.part === 0) {
        // ret = 已經有幾層回傳了（從最上層算）；正在回傳的那一層高亮，更上面的已經拿掉
        const now = s.ret ? calls.length - s.ret : s.n - 1;
        return '<div class="an-stack">' + calls.slice(0, s.n).map((c, i) => {
          const cls = i === now ? "hot" : i > now ? "gone" : "";
          return `<div class="an-frame ${cls}">gcd(${c.join(", ")})${s.ret && i >= now ? "\u3000→ 回傳 6" : ""}</div>`;
        }).join("") + "</div>";
      }
      const count = {};
      tree.forEach((t) => { count[t.n] = (count[t.n] || 0) + 1; });
      const seen = {};
      return '<div class="an-tree">' + tree.slice(0, s.shown).map((t) => {
        seen[t.n] = (seen[t.n] || 0) + 1;
        return `<div style="--d:${t.d}"><span class="${s.dup && count[t.n] > 1 && t.n < 3 ? "dup" : ""}">fib(${t.n})</span></div>`;
      }).join("") + "</div>";
    },
  });
})();

// 第 12 章：p = &n 畫出箭頭；*p 沿著箭頭改到 n；用指標寫的 swap
(function () {
  const box = (name, addr, val, cls) => `<div class="an-box ${cls || ""}"><small>${name}（位址 ${addr}）</small><b>${esc(val)}</b></div>`;
  const P0 = (n, p, arrow, hot) => ({ part: 0, n, p, arrow, hot });
  const P1 = (a, b, t, hot, done) => ({ part: 1, a, b, t, hot, done });
  defineAnim("pointer-arrow", {
    title: "指標：存位址的變數",
    steps: [
      { text: "`int n = 5;`：n 住在位址 0x100 的格子裡。", s: P0("5", null, false, "n") },
      { text: "`int *p;`：p 是指標變數，它的格子裡要放的是「位址」。現在還沒給值。", s: P0("5", "?", false, "p") },
      { text: "`p = &n;`：&n 是 n 的位址 0x100，把它放進 p。我們說「**p 指向 n**」。", s: P0("5", "0x100", true, "p") },
      { text: "`*p = 100;`：*p 的意思是「沿著箭頭走到 p 指的地方」，所以改到的是 **n**。", s: P0("100", "0x100", true, "n") },
      { text: "用指標寫 swap：`swap(&a, &b);` 傳進去的是 a、b 的**位址**，x 指向 a、y 指向 b。", s: P1("3", "5", "", "xy") },
      { text: "`int t = *x;`：沿著 x 走到 a，拿到 3。", s: P1("3", "5", "3", "a") },
      { text: "`*x = *y;`：把 b 的值 5 寫到 x 指的地方，也就是 a。", s: P1("5", "5", "3", "a") },
      { text: "`*y = t;`：把 3 寫到 y 指的地方，也就是 b。回到 main，a、b 真的交換了。這就是 scanf 要寫 & 的原因：它也需要知道變數的位址才能改到它。", s: P1("5", "3", "3", "b", true) },
    ],
    render(s) {
      if (s.part === 0) {
        return '<div class="an-flex">' + box("int *p", "0x200", s.p === null ? "（還沒宣告）" : s.p, s.hot === "p" ? "hot" : s.p === null ? "dim" : "") +
          `<div class="an-arrow${s.arrow ? " on" : ""}">${s.arrow ? "──指向──→" : "\u3000"}</div>` + box("int n", "0x100", s.n, s.hot === "n" ? "hot" : "") + "</div>";
      }
      return '<div class="an-note">swap 的 frame</div><div class="an-flex">' + box("int *x", "0x300", "0x110 → a", s.hot === "xy" ? "hot" : "") +
        box("int *y", "0x308", "0x114 → b", s.hot === "xy" ? "hot" : "") + box("int t", "0x310", s.t || "?", "") + "</div>" +
        '<div class="an-note">main 的 frame</div><div class="an-flex">' + box("int a", "0x110", s.a, s.hot === "a" ? "hot" : s.done ? "ok" : "") +
        box("int b", "0x114", s.b, s.hot === "b" ? "hot" : s.done ? "ok" : "") + "</div>";
    },
  });
})();

// 第 13 章：一直除以 2，餘數由下往上讀就是二進位
(function () {
  const rows = [];
  let n = 21;
  while (n > 0) { rows.push([n, Math.floor(n / 2), n % 2]); n = Math.floor(n / 2); }
  const steps = [{ text: "把 21 轉成二進位：不斷除以 2，記下餘數。", s: { k: 0 } }];
  rows.forEach((r, i) => steps.push({ text: `${r[0]} ÷ 2 = ${r[1]} 餘 **${r[2]}**${r[1] === 0 ? "。商變成 0，停下來。" : "。"}`, s: { k: i + 1 } }));
  steps.push({ text: "餘數要**由下往上**讀：10101。第一個算出來的餘數是最低位（個位），所以 1-P3 Parity 要先存進陣列再倒著印。", s: { k: rows.length, read: true } });
  defineAnim("to-binary", {
    title: "十進位轉二進位",
    steps,
    render(s) {
      let t = '<table class="pa"><thead><tr><th>被除數</th><th>÷ 2 =</th><th>餘數</th></tr></thead><tbody>';
      rows.slice(0, s.k).forEach((r, i) => { t += `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="${s.read || i === s.k - 1 ? "chg" : ""}">${r[2]}</td></tr>`; });
      t += "</tbody></table>";
      const bin = s.read ? `<div class="an-flex"><div class="an-arrow on">↑ 由下往上讀</div><div class="an-box ok"><small>21 的二進位</small><b>${rows.map((r) => r[2]).reverse().join("")}</b></div></div>` : "";
      return `<div class="an-flex"><div>${t}</div>${bin}</div>`;
    },
  });
})();

// 第 13 章：1-P9 貪婪法：從最大的費氏數開始拿
(function () {
  const fib = [1, 2, 3, 5, 8, 13];
  const steps = [{ text: "把 17 寫成費氏進位。可以用的費氏數：1、2、3、5、8、13（21 已經超過 17）。從**最大的**開始試。", s: { k: fib.length, x: 17, bits: [] } }];
  let x = 17;
  const bits = [];
  for (let i = fib.length - 1; i >= 0; i--) {
    const take = fib[i] <= x;
    bits.push(take ? 1 : 0);
    steps.push({ text: take ? `${fib[i]} ≤ ${x}：拿！這一位寫 1，剩下 ${x} − ${fib[i]} = ${x - fib[i]}。` : `${fib[i]} > ${x}：拿不了，這一位寫 0。`,
      s: { k: i, x: take ? x - fib[i] : x, bits: bits.slice(), take } });
    if (take) x -= fib[i];
  }
  steps.push({ text: "17 = 13 + 3 + 1 → **100101 (fib)**。每次都拿「能拿的最大的」，結果自然不會有兩個連續的 1。", s: { k: -1, x: 0, bits: bits.slice(), done: true } });
  defineAnim("greedy-fib", {
    title: "貪婪法：費氏進位（1-P9）",
    steps,
    render(s) {
      const row = fib.slice().reverse().map((f, j) => {
        const i = fib.length - 1 - j;
        return { v: f, bot: j < s.bits.length ? s.bits[j] : "", cls: i === s.k ? (s.take ? "ok hot" : "hot") : j < s.bits.length && s.bits[j] ? "ok" : j < s.bits.length ? "dim" : "" };
      });
      return cellRow(row, "費氏數") + `<div class="an-flex"><div class="an-box"><small>還剩</small><b>${s.x}</b></div>` +
        `<div class="an-box ${s.done ? "ok" : ""}"><small>寫下來的位數</small><b>${s.bits.join("") || "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 13 章：0-P5 Cola 的模擬：3 個空瓶換 1 瓶，最後借 1 個
(function () {
  const st = (full, empty, drunk, borrow, text) => ({ text, s: { full, empty, drunk, borrow } });
  defineAnim("cola-sim", {
    title: "模擬：空瓶換可樂（0-P5）",
    steps: [
      st(8, 0, 0, 0, "買了 8 瓶可樂。"),
      st(0, 8, 8, 0, "全部喝完：喝了 8 瓶，手上有 8 個空瓶。"),
      st(2, 2, 8, 0, "8 個空瓶換可樂：`8 / 3 = 2` 瓶，剩下 `8 % 3 = 2` 個空瓶。"),
      st(0, 4, 10, 0, "喝完這 2 瓶：一共喝了 10 瓶，空瓶變成 2 + 2 = 4 個。"),
      st(1, 1, 10, 0, "4 個空瓶換 1 瓶，剩 1 個空瓶。"),
      st(0, 2, 11, 0, "喝完：一共 11 瓶，手上 2 個空瓶，不夠換了……"),
      st(1, 0, 11, 1, "向朋友**借 1 個空瓶**（虛線），湊成 3 個，換 1 瓶。"),
      st(0, 0, 12, 0, "喝完之後，把這個空瓶還給朋友。一共喝了 **12** 瓶。"),
      st(0, 0, 12, 0, "多試幾個 N 會發現答案就是 ⌊3N / 2⌋（8 × 3 / 2 = 12）：先模擬，再從結果找規律。"),
    ],
    render(s) {
      const b = (k, cls) => `<span class="bt ${cls}"></span>`.repeat(k);
      return `<div class="an-flex"><div class="an-box"><small>沒喝的</small>${b(s.full, "") || "&nbsp;"}</div>` +
        `<div class="an-box"><small>空瓶</small>${b(s.empty, "empty") + b(s.borrow, "borrow") || "&nbsp;"}</div>` +
        `<div class="an-box hot"><small>一共喝了</small><b>${s.drunk}</b></div></div>`;
    },
  });
})();
