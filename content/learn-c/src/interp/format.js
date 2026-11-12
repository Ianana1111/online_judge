// printf 的格式處理，以及 printf / scanf 格式和參數型態不符時的警告。
// 字串一律用「binary string」表示：每個字元的 char code 就是一個 byte（0~255）。
(function (CI) {
  'use strict';
  const { T, typeName, reinterpret, is64, isPtr, isInt, isFloat, addrOf } = CI;

  // ---------- 解析格式字串 ----------
  function parseFormat(s, kind) {
    const items = [];
    let lit = '', i = 0;
    const flush = () => { if (lit) { items.push({ lit }); lit = ''; } };
    while (i < s.length) {
      const c = s[i];
      if (kind === 'scanf' && /\s/.test(c)) {
        flush();
        while (i < s.length && /\s/.test(s[i])) i++;
        items.push({ ws: true });
        continue;
      }
      if (c !== '%') { lit += c; i++; continue; }
      const start = i;
      i++;
      if (s[i] === '%') { lit += '%'; i++; continue; }
      flush();
      const sp = { flags: '', width: null, prec: null, len: '', conv: '', suppress: false };
      if (kind === 'printf') {
        while ('-+ #0'.includes(s[i] || 'x')) sp.flags += s[i++];
        if (s[i] === '*') { sp.width = '*'; i++; } else { const m = /^\d+/.exec(s.slice(i)); if (m) { sp.width = +m[0]; i += m[0].length; } }
        if (s[i] === '.') {
          i++;
          if (s[i] === '*') { sp.prec = '*'; i++; } else { const m = /^\d*/.exec(s.slice(i)); sp.prec = +(m[0] || 0); i += m[0].length; }
        }
      } else {
        if (s[i] === '*') { sp.suppress = true; i++; }
        const m = /^\d+/.exec(s.slice(i));
        if (m) { sp.width = +m[0]; i += m[0].length; }
      }
      const lm = /^(hh|h|ll|l|L|z|j|t)/.exec(s.slice(i));
      if (lm) { sp.len = lm[0]; i += lm[0].length; }
      sp.conv = s[i] || '';
      i++;
      if (kind === 'scanf' && sp.conv === '[') {
        let j = i;
        if (s[j] === '^') j++;
        if (s[j] === ']') j++;
        while (j < s.length && s[j] !== ']') j++;
        sp.set = s.slice(i, j);
        i = j + 1;
      }
      sp.text = s.slice(start, i);
      const ok = kind === 'printf' ? 'diuxXocsfFeEgGp' : 'diuxXoscfeEgG[';
      if (!sp.conv || !ok.includes(sp.conv)) items.push({ bad: sp.text, conv: sp.conv });
      else items.push({ spec: sp });
    }
    flush();
    return items;
  }

  // ---------- 浮點數：用 BigInt 算出精確的十進位，再四捨六入五成雙（和 glibc 一樣） ----------
  function exactDigits(x) {                // x > 0 且有限；回傳 value = 0.d × 10^p
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, x);
    const hi = dv.getUint32(0), lo = dv.getUint32(4);
    const eb = (hi >>> 20) & 0x7ff;
    let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), e;
    if (eb === 0) e = -1074; else { m |= 1n << 52n; e = eb - 1075; }
    if (e >= 0) { const s = (m << BigInt(e)).toString(); return { d: s, p: s.length }; }
    const s = (m * 5n ** BigInt(-e)).toString();
    return { d: s, p: s.length + e };
  }
  function roundDigits(d, p, k) {          // 只保留前 k 位
    if (k < 0) return { d: '', p };
    if (k >= d.length) return { d: d + '0'.repeat(k - d.length), p };
    const rest = d.slice(k);
    const up = rest[0] > '5' || (rest[0] === '5' && (/[1-9]/.test(rest.slice(1)) || (k > 0 && (d.charCodeAt(k - 1) & 1))));
    let kept = d.slice(0, k);
    if (up) {
      const n = (BigInt(kept || '0') + 1n).toString();
      if (n.length > k) return { d: n, p: p + 1 };
      kept = n.padStart(k, '0');
    }
    return { d: kept, p };
  }
  function fixedStr(x, prec) {
    if (x === 0) return '0' + (prec ? '.' + '0'.repeat(prec) : '');
    const { d, p } = exactDigits(x);
    const r = roundDigits(d, p, p + prec);
    const digits = r.d;
    let ip, fp;
    if (r.p > 0) { ip = digits.slice(0, r.p) || '0'; fp = digits.slice(r.p); }
    else { ip = '0'; fp = ('0'.repeat(-r.p) + digits); }
    fp = (fp + '0'.repeat(prec)).slice(0, prec);
    return ip + (prec ? '.' + fp : '');
  }
  function expParts(x, prec) {             // 回傳 { m: 'd.ddd' 的數字串（沒有小數點）, e: 指數 }
    if (x === 0) return { m: '0'.repeat(prec + 1), e: 0 };
    const { d, p } = exactDigits(x);
    const r = roundDigits(d, p, prec + 1);
    return { m: r.d.slice(0, prec + 1), e: r.p - 1 };
  }
  function expStr(x, prec, upper, hash) {
    const { m, e } = expParts(x, prec);
    const ee = (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0');
    return m[0] + (prec || hash ? '.' + m.slice(1) : '') + (upper ? 'E' : 'e') + ee;
  }
  function genStr(x, prec, upper, hash) {
    const P = prec === 0 ? 1 : prec;
    const X = x === 0 ? 0 : expParts(x, P - 1).e;
    let s;
    if (P > X && X >= -4) s = fixedStr(x, P - 1 - X);
    else s = expStr(x, P - 1, upper, hash);
    if (!hash) {
      const ePos = s.search(/[eE]/);
      let mant = ePos < 0 ? s : s.slice(0, ePos);
      const tail = ePos < 0 ? '' : s.slice(ePos);
      if (mant.includes('.')) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
      s = mant + tail;
    } else if (!s.includes('.')) {
      const ePos = s.search(/[eE]/);
      s = ePos < 0 ? s + '.' : s.slice(0, ePos) + '.' + s.slice(ePos);
    }
    return s;
  }

  function pad(head, body, sp, zeroOk) {
    const w = sp.width || 0, len = head.length + body.length;
    if (len >= w) return head + body;
    if (sp.flags.includes('-')) return head + body + ' '.repeat(w - len);
    if (zeroOk && sp.flags.includes('0')) return head + '0'.repeat(w - len) + body;
    return ' '.repeat(w - len) + head + body;
  }

  const INT_TARGET = { '': [T.int, T.uint], hh: [T.int, T.uint], h: [T.int, T.uint], l: [T.long, T.ulong],
    ll: [T.llong, T.ullong], z: [T.long, T.ulong], j: [T.long, T.ulong], t: [T.long, T.ulong] };

  // printf 執行：回傳輸出的 binary string
  function printf(ctx, items, args, tys, line) {
    let out = '', ai = 0;
    const take = (sp) => {
      if (ai >= args.length) {
        throw new CI.RErr(line, `printf 的格式「${sp.text}」沒有對應的值：格式裡的 % 比後面的參數多`);
      }
      const r = [args[ai], tys[ai]];
      ai++;
      return r;
    };
    const takeInt = (sp) => { const [v, t] = take(sp); return Number(reinterpret(v, t, T.int)); };
    for (const it of items) {
      if (it.lit !== undefined) { out += it.lit; continue; }
      if (it.bad !== undefined) { out += it.bad; continue; }
      const sp = Object.assign({}, it.spec);
      if (sp.width === '*') { const w = takeInt(sp); sp.width = Math.abs(w); if (w < 0) sp.flags += '-'; }
      if (sp.prec === '*') { const p = takeInt(sp); sp.prec = p < 0 ? null : p; }
      const c = sp.conv;
      const [v, t] = take(sp);
      if ('diuxXoc'.includes(c)) {
        const signed = c === 'd' || c === 'i';
        let n = reinterpret(v, t, INT_TARGET[sp.len][signed ? 0 : 1]);
        if (sp.len === 'h') n = signed ? (Number(n) << 16) >> 16 : Number(n) & 65535;
        if (sp.len === 'hh' || c === 'c') n = signed || c === 'c' ? (Number(n) << 24) >> 24 : Number(n) & 255;
        if (c === 'c') { out += pad('', String.fromCharCode(n & 255), sp, false); continue; }
        const big = BigInt(n), neg = big < 0n, abs = neg ? -big : big;
        let digits = abs.toString(c === 'o' ? 8 : c === 'x' || c === 'X' ? 16 : 10);
        if (c === 'X') digits = digits.toUpperCase();
        if (sp.prec != null) { if (sp.prec === 0 && abs === 0n) digits = ''; digits = digits.padStart(sp.prec, '0'); }
        let head = neg ? '-' : signed && sp.flags.includes('+') ? '+' : signed && sp.flags.includes(' ') ? ' ' : '';
        if (sp.flags.includes('#')) {
          if (c === 'o' && digits[0] !== '0') digits = '0' + digits;
          if ((c === 'x' || c === 'X') && abs !== 0n) head += c === 'x' ? '0x' : '0X';
        }
        out += pad(head, digits, sp, sp.prec == null);
      } else if ('fFeEgG'.includes(c)) {
        const x = t.k === 'float' ? v : reinterpret(v, t, T.double);
        const neg = x < 0 || Object.is(x, -0);
        const ax = Math.abs(x), upper = c === 'F' || c === 'E' || c === 'G', hash = sp.flags.includes('#');
        const prec = sp.prec == null ? 6 : sp.prec;
        let body;
        if (!Number.isFinite(ax)) body = Number.isNaN(ax) ? 'nan' : 'inf';
        else if (c === 'f' || c === 'F') body = fixedStr(ax, prec) + (hash && prec === 0 ? '.' : '');
        else if (c === 'e' || c === 'E') body = expStr(ax, prec, upper, hash);
        else body = genStr(ax, prec, upper, hash);
        if (upper) body = body.toUpperCase();
        const head = neg ? '-' : sp.flags.includes('+') ? '+' : sp.flags.includes(' ') ? ' ' : '';
        out += pad(head, body, sp, Number.isFinite(ax));
      } else if (c === 's') {
        if (!isPtr(t)) throw new CI.RErr(line, `printf 的「${sp.text}」要配字串（char 陣列或 char *），但給的是 ${typeName(t)}`);
        let s = CI.readCStr(ctx, v, line, 'printf 的 %s');
        if (sp.prec != null) s = s.slice(0, sp.prec);
        out += pad('', s, sp, false);
      } else if (c === 'p') {
        const a = isPtr(t) ? addrOf(v) : Number(reinterpret(v, t, T.ulong));
        out += pad('', a === 0 ? '(nil)' : '0x' + a.toString(16), sp, false);
      }
    }
    return out;
  }

  // ---------- 格式檢查（產生警告；對應 gcc/clang 的 -Wformat） ----------
  function suggestFor(t, kind) {
    if (isPtr(t)) {
      if (kind === 'printf') return t.to.k === 'int' && t.to.size === 1 ? '%s' : '%p';
      const to = t.to;
      if (to.k === 'arr' && to.of.k === 'int' && to.of.size === 1) return '%s';
      if (isFloat(to)) return to.size === 4 ? '%f' : to.size === 8 ? '%lf' : '%Lf';
      if (isInt(to) && to.size === 1) return '%c（讀一個字元）或 %hhd（讀一個數字）';
      return isInt(to) ? suggestFor(to, 'printf') : null;
    }
    if (isFloat(t)) return t.size === 16 ? '%Lf' : '%f';
    if (isInt(t)) {
      if (t.name === 'size_t') return '%zu';
      if (t.size === 1 && !t.isBool && kind === 'printf') return '%c 或 %d';
      if (t.size === 8) return (t.rank === 5 ? '%ll' : '%l') + (t.signed ? 'd' : 'u');
      if (t.size === 2) return t.signed ? '%hd' : '%hu';
      return t.signed ? '%d' : '%u';
    }
    return null;
  }
  const intWant = (len) => ({ '': { size: 4, name: 'int' }, hh: { size: 1, name: 'char' }, h: { size: 2, name: 'short' },
    l: { size: 8, rank: 4, name: 'long' }, ll: { size: 8, rank: 5, name: 'long long' }, z: { size: 8, rank: 4, name: 'size_t' },
    j: { size: 8, rank: 4, name: 'intmax_t' }, t: { size: 8, rank: 4, name: 'ptrdiff_t' } })[len];

  function checkFormat(kind, items, args, warn, line) {
    let ai = 0;
    const ord = (k) => `第 ${k + 2} 個參數`;
    for (const it of items) {
      if (it.bad !== undefined) {
        warn(line, it.conv ? `「${it.bad}」不是正確的格式（% 後面接的字母不對）` : '格式字串最後多了一個 %；要印出 % 請寫 %%');
        continue;
      }
      if (!it.spec) continue;
      const sp = it.spec;
      if (kind === 'printf') { if (sp.width === '*') ai++; if (sp.prec === '*') ai++; }
      if (kind === 'scanf' && sp.suppress) continue;
      const a = args[ai], k = ai;
      ai++;
      if (!a) continue;
      const t = a.ty, c = sp.conv;
      const bad = (wantName) => {
        const sug = suggestFor(kind === 'printf' ? a.orig || t : t, kind);
        warn(line, `「${sp.text}」要配 ${wantName}，但${ord(k)}是 ${typeName(a.orig || t)}` + (sug ? `（要改用 ${sug}）` : ''));
      };
      if (kind === 'printf') {
        if ('diuxXo'.includes(c)) {
          const w = intWant(sp.len);
          if (!isInt(t) || t.size !== Math.max(w.size, 4) || (w.rank && t.rank !== w.rank && t.name !== 'size_t')) {
            bad(sp.len === 'z' ? 'size_t' : (c === 'd' || c === 'i' ? '' : 'unsigned ') + w.name);
          }
        } else if (c === 'c') { if (!isInt(t) || t.size !== 4) bad('char（int）'); }
        else if ('fFeEgG'.includes(c)) {
          if (!isFloat(t) || (sp.len === 'L') !== (t.size === 16)) bad(sp.len === 'L' ? 'long double' : 'double（float 也可以）');
        } else if (c === 's') {
          if (!isPtr(t) || t.to.k !== 'int' || t.to.size !== 1) bad('字串（char 陣列或 char *）');
        } else if (c === 'p') { if (!isPtr(t)) bad('指標'); }
        continue;
      }
      // scanf：每個參數都要是位址
      if (!isPtr(t)) {
        warn(line, `scanf 的${ord(k)}要傳位址，是不是忘了 &？（例如 &x）`);
        continue;
      }
      const to = t.to;
      if (c === 's' || c === '[' || c === 'c') {
        if (to.k === 'arr' && to.of.k === 'int' && to.of.size === 1) {
          warn(line, `「${sp.text}」的參數不需要 &：陣列名稱本身就是位址，直接寫陣列名稱就好`);
        } else if (to.k !== 'int' || to.size !== 1) bad('char 陣列（字串）');
      } else if ('diuxXo'.includes(c)) {
        const w = intWant(sp.len);
        if (to.k !== 'int' || to.size !== w.size || (w.rank && to.rank !== w.rank && to.name !== 'size_t')) {
          bad(`${(c === 'd' || c === 'i' ? '' : 'unsigned ') + w.name} *`);
        }
      } else if ('feEgG'.includes(c)) {
        const want = sp.len === 'l' ? 8 : sp.len === 'L' ? 16 : 4;
        if (to.k === 'float' && to.size === 8 && want === 4) warn(line, `double 要用 %lf 讀（「${sp.text}」是給 float 用的）`);
        else if (to.k !== 'float' || to.size !== want) bad(`${want === 8 ? 'double' : want === 16 ? 'long double' : 'float'} *`);
      }
    }
    if (args.length < ai) warn(line, `格式裡需要 ${ai} 個值，但後面只給了 ${args.length} 個`);
    else if (args.length > ai) warn(line, `後面多給了參數：格式只用到 ${ai} 個值，但給了 ${args.length} 個`);
  }

  Object.assign(CI, { parseFormat, printf, checkFormat, fixedStr, genStr });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));
