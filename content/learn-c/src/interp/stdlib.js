// 函式庫：每個函式記錄「屬於哪個標頭檔、回傳型態、參數型態」，以及執行時的實作。
// 執行時的實作收到 (ctx, args, call)：args 是已經轉好型態的值，call 是呼叫節點（有 line、argTys）。
(function (CI) {
  'use strict';
  const { T, ptr, NULLP, RErr, reinterpret } = CI;
  const CS = ptr(T.char), VP = ptr(T.void), D = T.double;

  const LIB = {};
  const def = (h, name, ret, params, run, extra) => { LIB[name] = Object.assign({ h, name, ret, params, run }, extra || {}); };

  // ---------- stdio.h ----------
  def('stdio.h', 'printf', T.int, [CS], (ctx, a, call) => {
    const items = call.fmtItems || CI.parseFormat(CI.readCStr(ctx, a[0], call.line, 'printf 的格式'), 'printf');
    const s = CI.printf(ctx, items, a.slice(1), call.argTys.slice(1), call.line);
    CI.output(ctx, s, call.line);
    return s.length;
  }, { variadic: true, fmt: 'printf' });
  def('stdio.h', 'scanf', T.int, [CS], (ctx, a, call) => {
    const items = call.fmtItems || CI.parseFormat(CI.readCStr(ctx, a[0], call.line, 'scanf 的格式'), 'scanf');
    return CI.scanf(ctx, items, a.slice(1), call.argTys.slice(1), call.line);
  }, { variadic: true, fmt: 'scanf' });
  def('stdio.h', 'getchar', T.int, [], (ctx) => (ctx.ip < ctx.input.length ? ctx.input.charCodeAt(ctx.ip++) : -1));
  def('stdio.h', 'putchar', T.int, [T.int], (ctx, a, call) => {
    CI.output(ctx, String.fromCharCode(a[0] & 255), call.line);
    return a[0] & 255;
  });
  def('stdio.h', 'puts', T.int, [CS], (ctx, a, call) => {
    const s = CI.readCStr(ctx, a[0], call.line, 'puts');
    CI.output(ctx, s + '\n', call.line);
    return s.length + 1;
  });
  def('stdio.h', 'fgets', CS, [CS, T.int, T.file], (ctx, a, call) => {
    if (a[2] !== ctx.stdin) throw new RErr(call.line, '練習環境的 fgets 只能從 stdin 讀');
    const s = ctx.input;
    if (ctx.ip >= s.length || a[1] <= 1) return a[1] === 1 ? (CI.storeBytes(ctx, a[0], CS, '', true, call.line, 1, 'fgets'), a[0]) : NULLP;
    let j = ctx.ip;
    while (j < s.length && j - ctx.ip < a[1] - 1) { j++; if (s[j - 1] === '\n') break; }
    CI.storeBytes(ctx, a[0], CS, s.slice(ctx.ip, j), true, call.line, 1, 'fgets');
    ctx.ip = j;
    return a[0];
  });
  def('stdio.h', 'fflush', T.int, [T.file], () => 0);

  // ---------- string.h ----------
  const bytesOf = (ctx, p, call, what) => CI.readCStr(ctx, p, call.line, what);
  def('string.h', 'strlen', T.size_t, [CS], (ctx, a, call) => BigInt(bytesOf(ctx, a[0], call, 'strlen').length));
  const cmp = (x, y, n) => {
    for (let i = 0; i < n; i++) {
      const c1 = i < x.length ? x.charCodeAt(i) : 0, c2 = i < y.length ? y.charCodeAt(i) : 0;
      if (c1 !== c2) return c1 - c2;
      if (c1 === 0) return 0;
    }
    return 0;
  };
  def('string.h', 'strcmp', T.int, [CS, CS], (ctx, a, call) => {
    const x = bytesOf(ctx, a[0], call, 'strcmp'), y = bytesOf(ctx, a[1], call, 'strcmp');
    return cmp(x, y, Math.max(x.length, y.length) + 1);
  });
  def('string.h', 'strncmp', T.int, [CS, CS, T.size_t], (ctx, a, call) =>
    cmp(bytesOf(ctx, a[0], call, 'strncmp'), bytesOf(ctx, a[1], call, 'strncmp'), Number(a[2])));
  def('string.h', 'strcpy', CS, [CS, CS], (ctx, a, call) => {
    CI.storeBytes(ctx, a[0], CS, bytesOf(ctx, a[1], call, 'strcpy'), true, call.line, 1, 'strcpy');
    return a[0];
  });
  def('string.h', 'strncpy', CS, [CS, CS, T.size_t], (ctx, a, call) => {
    const n = Number(a[2]);
    let s = bytesOf(ctx, a[1], call, 'strncpy').slice(0, n);
    s += '\0'.repeat(n - s.length);
    CI.storeBytes(ctx, a[0], CS, s, false, call.line, 1, 'strncpy');
    return a[0];
  });
  def('string.h', 'strcat', CS, [CS, CS], (ctx, a, call) => {
    const d = bytesOf(ctx, a[0], call, 'strcat'), s = bytesOf(ctx, a[1], call, 'strcat');
    CI.storeBytes(ctx, { b: a[0].b, o: a[0].o + d.length }, CS, s, true, call.line, 1, 'strcat', a[0]);
    return a[0];
  });
  def('string.h', 'strchr', CS, [CS, T.int], (ctx, a, call) => {
    const s = bytesOf(ctx, a[0], call, 'strchr'), c = a[1] & 255;
    const i = c === 0 ? s.length : s.indexOf(String.fromCharCode(c));
    return i < 0 ? NULLP : { b: a[0].b, o: a[0].o + i };
  });
  def('string.h', 'strstr', CS, [CS, CS], (ctx, a, call) => {
    const i = bytesOf(ctx, a[0], call, 'strstr').indexOf(bytesOf(ctx, a[1], call, 'strstr'));
    return i < 0 ? NULLP : { b: a[0].b, o: a[0].o + i };
  });
  def('string.h', 'memset', VP, [VP, T.int, T.size_t], (ctx, a, call) => CI.memset(ctx, a[0], a[1], Number(a[2]), call.line));

  // ---------- stdlib.h ----------
  def('stdlib.h', 'abs', T.int, [T.int], (ctx, a) => Math.abs(a[0]) | 0);
  def('stdlib.h', 'labs', T.long, [T.long], (ctx, a) => BigInt.asIntN(64, a[0] < 0n ? -a[0] : a[0]));
  def('stdlib.h', 'llabs', T.llong, [T.llong], (ctx, a) => BigInt.asIntN(64, a[0] < 0n ? -a[0] : a[0]));
  def('stdlib.h', 'atoi', T.int, [CS], (ctx, a, call) => {
    const m = /^[ \t\n\r\v\f]*([+-]?\d+)/.exec(bytesOf(ctx, a[0], call, 'atoi'));
    if (!m) return 0;
    let v = BigInt(m[1]);
    v = v > 2n ** 63n - 1n ? 2n ** 63n - 1n : v < -(2n ** 63n) ? -(2n ** 63n) : v;
    return Number(BigInt.asIntN(32, v));
  });
  // rand() 用和 glibc 一樣的演算法，同樣的 srand 會得到和 judge.tw（Linux gcc）一樣的亂數
  function seedRand(ctx, seed) {
    const r = new Array(34);
    r[0] = seed | 0;
    if (r[0] === 0) r[0] = 1;
    for (let i = 1; i < 31; i++) {
      const hi = Math.trunc(r[i - 1] / 127773), lo = r[i - 1] % 127773;
      let word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      r[i] = word;
    }
    for (let i = 31; i < 34; i++) r[i] = r[i - 31];
    ctx.rnd = { r, k: 34 };
    for (let i = 0; i < 310; i++) nextRand(ctx);
  }
  function nextRand(ctx) {
    if (!ctx.rnd) seedRand(ctx, 1);
    const g = ctx.rnd;
    const v = (g.r[g.k - 31] + g.r[g.k - 3]) >>> 0;
    g.r.push(v);
    g.k++;
    if (g.r.length > 1000) { g.r = g.r.slice(-40); g.k = g.r.length; }
    return v >>> 1;
  }
  def('stdlib.h', 'rand', T.int, [], (ctx) => nextRand(ctx));
  def('stdlib.h', 'srand', T.void, [T.uint], (ctx, a) => { seedRand(ctx, a[0]); });
  def('stdlib.h', 'exit', T.void, [T.int], (ctx, a) => { throw new CI.Exit(a[0]); });

  // ---------- math.h ----------
  const m1 = (name, f) => def('math.h', name, D, [D], (ctx, a) => f(a[0]));
  m1('sqrt', Math.sqrt); m1('fabs', Math.abs); m1('floor', Math.floor); m1('ceil', Math.ceil);
  m1('log', Math.log); m1('log10', Math.log10); m1('log2', Math.log2); m1('exp', Math.exp);
  m1('sin', Math.sin); m1('cos', Math.cos); m1('tan', Math.tan); m1('atan', Math.atan);
  m1('round', (x) => { const t = Math.trunc(x); return Math.abs(x - t) >= 0.5 ? t + Math.sign(x) : t; });
  m1('trunc', Math.trunc);
  def('math.h', 'pow', D, [D, D], (ctx, a) => Math.pow(a[0], a[1]));
  def('math.h', 'fmod', D, [D, D], (ctx, a) => a[0] % a[1]);
  def('math.h', 'atan2', D, [D, D], (ctx, a) => Math.atan2(a[0], a[1]));

  // ---------- ctype.h（回傳值和 glibc 一樣：成立時是某個非 0 的數） ----------
  const cls = (c) => {
    if (c < 0 || c > 127) return 0;
    const ch = String.fromCharCode(c);
    let m = 0;
    if (/[A-Z]/.test(ch)) m |= 256;
    if (/[a-z]/.test(ch)) m |= 512;
    if (/[A-Za-z]/.test(ch)) m |= 1024;
    if (/[0-9]/.test(ch)) m |= 2048;
    if (/[0-9A-Fa-f]/.test(ch)) m |= 4096;
    if (/[ \t\n\v\f\r]/.test(ch)) m |= 8192;
    if (c >= 32 && c < 127) m |= 16384;
    if (c > 32 && c < 127) m |= 32768;
    if (c < 32 || c === 127) m |= 2;
    if (/[!-/:-@[-`{-~]/.test(ch)) m |= 4;
    if (/[A-Za-z0-9]/.test(ch)) m |= 8;
    if (c === 32 || c === 9) m |= 1;
    return m;
  };
  [['isupper', 256], ['islower', 512], ['isalpha', 1024], ['isdigit', 2048], ['isxdigit', 4096], ['isspace', 8192],
    ['isprint', 16384], ['isgraph', 32768], ['iscntrl', 2], ['ispunct', 4], ['isalnum', 8], ['isblank', 1]]
    .forEach(([n, bit]) => def('ctype.h', n, T.int, [T.int], (ctx, a) => cls(a[0]) & bit));
  def('ctype.h', 'toupper', T.int, [T.int], (ctx, a) => (a[0] >= 97 && a[0] <= 122 ? a[0] - 32 : a[0]));
  def('ctype.h', 'tolower', T.int, [T.int], (ctx, a) => (a[0] >= 65 && a[0] <= 90 ? a[0] + 32 : a[0]));

  // ---------- time.h、assert.h ----------
  def('time.h', 'time', T.time_t, [ptr(T.time_t)], (ctx, a, call) => {
    const t = BigInt(Math.floor(Date.now() / 1000));
    if (a[0].b) CI.storeVia(ctx, a[0], ptr(T.time_t), t, T.time_t, call.line, 1);
    return t;
  });
  def('assert.h', 'assert', T.void, [T.int], (ctx, a, call) => {
    if (a[0] === 0) throw new RErr(call.line, 'assert 失敗：括號裡的條件不成立，程式被中止了');
  });

  // ---------- 常數（標頭檔提供的巨集） ----------
  const CONST = {};
  const c = (h, name, ty, v) => { CONST[name] = { h, ty, v }; };
  c('stdio.h', 'EOF', T.int, -1);
  c(['stdio.h', 'stdlib.h', 'string.h', 'time.h'], 'NULL', VP, NULLP);
  c('stdio.h', 'stdin', T.file, 'stdin');
  c('stdio.h', 'stdout', T.file, 'stdout');
  c('stdlib.h', 'RAND_MAX', T.int, 2147483647);
  c('stdlib.h', 'EXIT_SUCCESS', T.int, 0);
  c('stdlib.h', 'EXIT_FAILURE', T.int, 1);
  c('stdbool.h', 'true', T.int, 1);
  c('stdbool.h', 'false', T.int, 0);
  c('math.h', 'M_PI', D, Math.PI);
  c('limits.h', 'INT_MAX', T.int, 2147483647);
  c('limits.h', 'INT_MIN', T.int, -2147483648);
  c('limits.h', 'UINT_MAX', T.uint, 4294967295);
  c('limits.h', 'LONG_MAX', T.long, 2n ** 63n - 1n);
  c('limits.h', 'LONG_MIN', T.long, -(2n ** 63n));
  c('limits.h', 'ULONG_MAX', T.ulong, 2n ** 64n - 1n);
  c('limits.h', 'LLONG_MAX', T.llong, 2n ** 63n - 1n);
  c('limits.h', 'LLONG_MIN', T.llong, -(2n ** 63n));
  c('limits.h', 'ULLONG_MAX', T.ullong, 2n ** 64n - 1n);
  c('limits.h', 'CHAR_MAX', T.int, 127);
  c('limits.h', 'CHAR_MIN', T.int, -128);
  c('limits.h', 'SCHAR_MAX', T.int, 127);
  c('limits.h', 'SCHAR_MIN', T.int, -128);
  c('limits.h', 'UCHAR_MAX', T.int, 255);
  c('limits.h', 'SHRT_MAX', T.int, 32767);
  c('limits.h', 'SHRT_MIN', T.int, -32768);
  c('limits.h', 'USHRT_MAX', T.int, 65535);
  c('limits.h', 'CHAR_BIT', T.int, 8);
  c('stdint.h', 'INT32_MAX', T.int, 2147483647);
  c('stdint.h', 'INT32_MIN', T.int, -2147483648);
  c('stdint.h', 'INT64_MAX', T.long, 2n ** 63n - 1n);
  c('stdint.h', 'INT64_MIN', T.long, -(2n ** 63n));

  // 用重複的 byte 填滿記憶體（memset）
  CI.memset = function (ctx, p, c, n, line) {
    if (!p.b) throw new RErr(line, p.o === 0 ? 'memset 用了空指標（NULL）' : 'memset 用了無效的指標');
    const et = p.b.et, cells = Math.floor(n / et.size);
    if (p.o < 0 || p.o + cells > p.b.n) {
      throw new RErr(line, `memset 寫超過了${CI.blockDesc(p.b)}的範圍：要設定 ${n} bytes，但從這個位置開始只剩 ${(p.b.n - p.o) * et.size} bytes`);
    }
    if (p.b.ro) throw new RErr(line, '字串常數不能修改');
    let pattern = 0n;
    for (let i = 0; i < 8; i++) pattern = (pattern << 8n) | BigInt(c & 255);
    const v = et.k === 'ptr' ? ((c & 255) === 0 ? NULLP : { b: null, o: 1 }) : reinterpret(pattern, T.ullong, et);
    for (let i = 0; i < cells; i++) p.b.c[p.o + i] = v;
    return p;
  };

  Object.assign(CI, { LIB, CONST });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));
