// 型態定義、錯誤類別、整數轉換（wrap）與 usual arithmetic conversions。
// 所有解譯器檔案都掛在 globalThis.CInterpParts（簡稱 CI）上，依 files 順序載入。
(function (CI) {
  'use strict';

  // ---------- 錯誤 ----------
  class CErr extends Error { constructor(line, msg) { super(msg); this.line = line; } }   // 編譯錯誤
  class RErr extends Error { constructor(line, msg) { super(msg); this.line = line; } }   // 執行錯誤
  class Limit extends Error { constructor(line, msg) { super(msg); this.line = line; } }  // 步數或輸出超過上限
  class Exit { constructor(code) { this.code = code; } }                                  // exit() 呼叫

  // ---------- 型態 ----------
  function mkInt(name, size, signed, rank, extra) {
    return Object.assign({ k: 'int', name, size, signed, rank }, extra || {});
  }
  const T = {
    bool: mkInt('bool', 1, false, 0, { isBool: true }),
    char: mkInt('char', 1, true, 1),
    schar: mkInt('signed char', 1, true, 1),
    uchar: mkInt('unsigned char', 1, false, 1),
    short: mkInt('short', 2, true, 2),
    ushort: mkInt('unsigned short', 2, false, 2),
    int: mkInt('int', 4, true, 3),
    uint: mkInt('unsigned int', 4, false, 3),
    long: mkInt('long', 8, true, 4),
    ulong: mkInt('unsigned long', 8, false, 4),
    llong: mkInt('long long', 8, true, 5),
    ullong: mkInt('unsigned long long', 8, false, 5),
    float: { k: 'float', name: 'float', size: 4 },
    double: { k: 'float', name: 'double', size: 8 },
    ldouble: { k: 'float', name: 'long double', size: 16 },
    void: { k: 'void', name: 'void', size: 1 },
  };
  // 標頭檔提供的 typedef（只是別名，型態相同但顯示原本的名字）
  T.size_t = mkInt('size_t', 8, false, 4);
  T.time_t = mkInt('time_t', 8, true, 4);
  T.file = { k: 'ptr', to: { k: 'void', name: 'FILE', size: 1 }, size: 8, isFile: true };
  const TYPEDEFS = {
    size_t: { ty: T.size_t, h: ['stdio.h', 'stdlib.h', 'string.h', 'time.h'] },
    time_t: { ty: T.time_t, h: ['time.h'] },
    bool: { ty: T.bool, h: ['stdbool.h'] },
  };
  [['int8_t', 1, true], ['uint8_t', 1, false], ['int16_t', 2, true], ['uint16_t', 2, false],
    ['int32_t', 4, true], ['uint32_t', 4, false], ['int64_t', 8, true], ['uint64_t', 8, false]].forEach(([n, s, sg]) => {
    TYPEDEFS[n] = { ty: mkInt(n, s, sg, { 1: 1, 2: 2, 4: 3, 8: 4 }[s]), h: ['stdint.h'] };
  });

  const ptr = (to) => ({ k: 'ptr', to, size: 8 });
  const arr = (of, len) => ({ k: 'arr', of, len, size: len != null && of.size != null ? of.size * len : null });
  const fn = (ret, params, variadic, unspec) => ({ k: 'fn', ret, params, variadic: !!variadic, unspec: !!unspec });

  const isInt = (t) => t.k === 'int';
  const isFloat = (t) => t.k === 'float';
  const isArith = (t) => t.k === 'int' || t.k === 'float';
  const isPtr = (t) => t.k === 'ptr';
  const isScalar = (t) => isArith(t) || isPtr(t);
  const is64 = (t) => t.k === 'int' && t.size === 8;

  function sameType(a, b) {
    if (a === b) return true;
    if (a.k !== b.k) return false;
    switch (a.k) {
      case 'int': return a.rank === b.rank && a.signed === b.signed && !!a.isBool === !!b.isBool && a.size === b.size;
      case 'float': return a.size === b.size;
      case 'void': return true;
      case 'ptr': return sameType(a.to, b.to);
      case 'arr': return (a.len == null || b.len == null || a.len === b.len) && sameType(a.of, b.of);
      case 'fn': return sameType(a.ret, b.ret) && a.params.length === b.params.length &&
        a.params.every((p, i) => sameType(p, b.params[i]));
    }
    return false;
  }

  function typeName(t) {
    if (t.k === 'ptr') {
      if (t.isFile) return 'FILE *';
      if (t.to.k === 'arr') {
        const d = arrDims(t.to);
        return `${typeName(d.base)} (*)${d.dims.map((x) => `[${x == null ? '' : x}]`).join('')}`;
      }
      const inner = typeName(t.to);
      return inner.endsWith('*') ? inner + '*' : inner + ' *';
    }
    if (t.k === 'arr') {
      const d = arrDims(t);
      return typeName(d.base) + d.dims.map((x) => `[${x == null ? '' : x}]`).join('');
    }
    if (t.k === 'fn') return `${typeName(t.ret)} (${t.params.map(typeName).join(', ')})`;
    return t.name;
  }
  function arrDims(t) {
    const dims = [];
    while (t.k === 'arr') { dims.push(t.len); t = t.of; }
    return { dims, base: t };
  }
  const scalarOf = (t) => { while (t.k === 'arr') t = t.of; return t; };

  // integer promotion：比 int 小的整數（含 bool、char、short）一律先變成 int
  const promote = (t) => (t.k === 'int' && t.rank < 3 ? T.int : t);
  const unsignedOf = (t) => (t.rank === 3 ? T.uint : t.rank === 4 ? T.ulong : T.ullong);

  // usual arithmetic conversions：兩邊運算前要先轉成同一個型態
  function uac(a, b) {
    if (a.k === 'float' || b.k === 'float') {
      const sa = a.k === 'float' ? a.size : 0, sb = b.k === 'float' ? b.size : 0;
      return sa >= sb ? a : b;
    }
    a = promote(a); b = promote(b);
    if (sameType(a, b)) return a;
    if (a.signed === b.signed) return a.rank >= b.rank ? a : b;
    const u = a.signed ? b : a, s = a.signed ? a : b;
    if (u.rank >= s.rank) return u;
    if (s.size > u.size) return s;
    return unsignedOf(s);
  }

  // ---------- 值的表示法 ----------
  // ≤ 4 bytes 的整數：JS number；8 bytes 的整數：BigInt；浮點數：number（float 用 Math.fround）
  // 指標：{ b: 記憶體區塊或 null, o: 格子的位移 }
  const NULLP = Object.freeze({ b: null, o: 0 });
  const addrOf = (p) => (p.b ? p.b.addr + p.o * p.b.esz : p.o);

  function wrapper(t) {
    if (t.isBool) return (v) => (v !== 0 ? 1 : 0);
    switch (t.size) {
      case 1: return t.signed ? (v) => (v << 24) >> 24 : (v) => v & 255;
      case 2: return t.signed ? (v) => (v << 16) >> 16 : (v) => v & 65535;
      default: return t.signed ? (v) => v | 0 : (v) => v >>> 0;
    }
  }
  function float2int(v) {                       // 浮點數 → 整數（往 0 截斷；超出範圍時模擬 x86 的結果）
    if (!Number.isFinite(v)) return -2147483648;
    return Math.trunc(v);
  }

  // 依「從哪個型態轉到哪個型態」產生轉換函式，執行時直接呼叫
  function makeConv(from, to) {
    if (to.k === 'void') return () => undefined;
    if (to.isBool) {
      if (from.k === 'ptr') return (v) => (v.b !== null || v.o !== 0 ? 1 : 0);
      if (is64(from)) return (v) => (v !== 0n ? 1 : 0);
      return (v) => (v !== 0 ? 1 : 0);
    }
    if (to.k === 'int' && to.size <= 4) {
      const w = wrapper(to);
      if (from.k === 'int') return from.size <= 4 ? w : (v) => w(Number(BigInt.asIntN(32, v)));
      if (from.k === 'float') {
        return (v) => {
          const t = float2int(v);
          return Math.abs(t) < 2 ** 53 ? w(t) : w(Number(BigInt.asIntN(32, BigInt(t))));
        };
      }
      if (from.k === 'ptr') return (v) => w(Number(BigInt.asIntN(32, BigInt(addrOf(v)))));
    }
    if (to.k === 'int') {               // 64 位元
      const cut = to.signed ? (x) => BigInt.asIntN(64, x) : (x) => BigInt.asUintN(64, x);
      if (from.k === 'int') {
        if (from.size <= 4) return to.signed || !from.signed ? (v) => BigInt(v) : (v) => cut(BigInt(v));
        return from.signed === to.signed ? (v) => v : cut;
      }
      if (from.k === 'float') {
        return (v) => (Number.isFinite(v) ? cut(BigInt(Math.trunc(v))) : (to.signed ? -(2n ** 63n) : 0n));
      }
      if (from.k === 'ptr') return (v) => cut(BigInt(addrOf(v)));
    }
    if (to.k === 'float') {
      const f = to.size === 4 ? Math.fround : (v) => v;
      if (from.k === 'int') return from.size <= 4 ? f : (v) => f(Number(v));
      if (from.k === 'float') return to.size === 4 && from.size !== 4 ? Math.fround : (v) => v;
    }
    if (to.k === 'ptr') {
      if (from.k === 'ptr') return (v) => v;
      if (from.k === 'int') return (v) => (v == 0 ? NULLP : { b: null, o: Number(v) }); // eslint-disable-line eqeqeq
    }
    return (v) => v;
  }

  function zeroOf(t) {
    if (t.k === 'ptr') return NULLP;
    if (is64(t)) return 0n;
    return 0;
  }

  // ---------- byte 層級的重新解讀（格式不符時模擬真實電腦的結果） ----------
  function toBytes(v, t) {
    const dv = new DataView(new ArrayBuffer(8));
    if (t.k === 'float') { if (t.size === 4) dv.setFloat32(0, v, true); else dv.setFloat64(0, v, true); }
    else if (t.k === 'ptr') dv.setBigUint64(0, BigInt(addrOf(v)), true);
    else if (is64(t)) dv.setBigUint64(0, BigInt.asUintN(64, v), true);
    else dv.setUint32(0, v >>> 0, true);
    return new Uint8Array(dv.buffer);
  }
  function fromBytes(bytes, t) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, 8);
    if (t.k === 'float') return t.size === 4 ? dv.getFloat32(0, true) : dv.getFloat64(0, true);
    if (is64(t)) return t.signed ? dv.getBigInt64(0, true) : dv.getBigUint64(0, true);
    return wrapper(t)(dv.getUint32(0, true));
  }
  // 把型態 from 的值，當成型態 to 的 bytes 讀出來（多出來的 byte 補 0）
  function reinterpret(v, from, to) {
    const b = new Uint8Array(8);
    b.set(toBytes(v, from).subarray(0, Math.min(from.size, 8)));
    return fromBytes(b, to);
  }
  // 只覆寫舊值的前 n 個 byte（例如用 %d 讀進 long long 變數）
  function overwriteLow(old, oldTy, v, vTy) {
    const b = new Uint8Array(8);
    if (old !== undefined) b.set(toBytes(old, oldTy).subarray(0, Math.min(oldTy.size, 8)));
    const n = Math.min(vTy.size, oldTy.size, 8);
    b.set(toBytes(v, vTy).subarray(0, n));
    return fromBytes(b, oldTy);
  }

  Object.assign(CI, {
    CErr, RErr, Limit, Exit, T, TYPEDEFS, ptr, arr, fn, NULLP, addrOf,
    isInt, isFloat, isArith, isPtr, isScalar, is64, sameType, typeName, arrDims, scalarOf,
    promote, unsignedOf, uac, wrapper, makeConv, zeroOf, reinterpret, overwriteLow,
  });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 前置處理（註解、#include、#define）＋ tokenizer。
(function (CI) {
  'use strict';
  const { CErr, T } = CI;

  const HEADERS = new Set(['stdio.h', 'stdlib.h', 'string.h', 'stdbool.h', 'math.h', 'ctype.h', 'limits.h',
    'time.h', 'stdint.h', 'assert.h']);
  const CPP_HEADERS = {
    iostream: 'stdio.h', cstdio: 'stdio.h', cstdlib: 'stdlib.h', cstring: 'string.h', cmath: 'math.h',
    cctype: 'ctype.h', climits: 'limits.h', ctime: 'time.h', cassert: 'assert.h', iomanip: 'stdio.h',
    string: 'string.h', 'bits/stdc++.h': null, vector: null, algorithm: null, map: null, set: null,
    queue: null, stack: null, fstream: null, sstream: null, utility: null,
  };
  const KEYWORDS = new Set(('auto break case char const continue default do double else enum extern float for goto ' +
    'if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned ' +
    'void volatile while _Bool').split(' '));
  const PUNCT = ['...', '<<=', '>>=', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '*=', '/=',
    '%=', '+=', '-=', '&=', '^=', '|=', '{', '}', '[', ']', '(', ')', ';', ',', ':', '?', '~', '!', '%', '^', '&',
    '*', '-', '+', '=', '<', '>', '|', '/', '.'];
  const FULLWIDTH = { '；': ';', '（': '(', '）': ')', '，': ',', '｛': '{', '｝': '}', '“': '"', '”': '"',
    '‘': "'", '’': "'", '＝': '=', '＋': '+', '－': '-', '＊': '*', '／': '/', '＜': '<', '＞': '>', '［': '[',
    '］': ']', '：': ':', '！': '!', '％': '%', '＆': '&', '｜': '|', '　': ' ' };

  const utf8 = (s) => Array.from(new TextEncoder().encode(s));

  // 把註解換成空白，但保留換行，行號才不會跑掉
  function stripComments(src) {
    let out = '', i = 0, line = 1;
    const n = src.length;
    while (i < n) {
      const c = src[i], d = src[i + 1];
      if (c === '/' && d === '/') {
        while (i < n && src[i] !== '\n') i++;
      } else if (c === '/' && d === '*') {
        const start = line;
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') { out += '\n'; line++; } i++; }
        if (i >= n) throw new CErr(start, '註解 /* 沒有用 */ 結束');
        i += 2; out += ' ';
      } else if (c === '"' || c === "'") {
        out += c; i++;
        while (i < n && src[i] !== c && src[i] !== '\n') {
          if (src[i] === '\\' && i + 1 < n && src[i + 1] !== '\n') { out += src[i]; i++; }
          out += src[i]; i++;
        }
        if (i < n && src[i] === c) { out += c; i++; }
      } else {
        if (c === '\n') line++;
        out += c; i++;
      }
    }
    return out;
  }

  // 前置處理：回傳 { code（已移除 # 指令的程式）, headers, macros }
  function preprocess(src, warn) {
    const text = stripComments(src.replace(/\r\n?/g, '\n'));
    const lines = text.split('\n');
    // 行尾的 \ 代表接到下一行：把下一行接上來，並留一個空行讓後面的行號不變
    for (let i = 0; i < lines.length - 1; i++) {
      let extra = 0;
      while (/\\\s*$/.test(lines[i]) && i + 1 + extra < lines.length) {
        lines[i] = lines[i].replace(/\\\s*$/, '') + lines[i + 1 + extra];
        lines[i + 1 + extra] = '';
        extra++;
      }
    }
    const headers = new Map(), macros = new Map();
    for (let i = 0; i < lines.length; i++) {
      const m = /^\s*#\s*(\w*)(.*)$/.exec(lines[i]);
      if (!m) continue;
      const line = i + 1, dir = m[1], rest = m[2];
      lines[i] = '';
      if (dir === 'include') {
        const h = /^\s*(?:<\s*([^>]+?)\s*>|"([^"]+)")\s*$/.exec(rest);
        if (!h) throw new CErr(line, '#include 的寫法是 #include <stdio.h>');
        const name = h[1] || h[2];
        if (HEADERS.has(name)) { if (!headers.has(name)) headers.set(name, line); continue; }
        if (name in CPP_HEADERS) {
          const s = CPP_HEADERS[name];
          throw new CErr(line, `<${name}> 是 C++ 的標頭檔，C 語言不能用。` + (s ? `請改成 #include <${s}>` : '請改用 C 的寫法。'));
        }
        if (h[2]) throw new CErr(line, `練習環境不能 include 自己的檔案 "${name}"，請把程式都寫在同一個檔案裡`);
        throw new CErr(line, `練習環境不支援 <${name}>。可以用的標頭檔有：${[...HEADERS].map((x) => `<${x}>`).join('、')}`);
      } else if (dir === 'define') {
        const d = /^\s+([A-Za-z_]\w*)(\(?)(.*)$/.exec(rest);
        if (!d) throw new CErr(line, '#define 後面要寫名字和值，例如 #define MAX 100');
        if (d[2]) throw new CErr(line, '練習環境不支援帶參數的 #define（巨集函式），請改寫成一般的函式');
        macros.set(d[1], { toks: tokenize(d[3], line, warn), line });
      } else if (dir === 'undef') {
        macros.delete(rest.trim());
      } else if (dir === 'pragma' || dir === '') {
        // 忽略
      } else {
        throw new CErr(line, `練習環境不支援 #${dir}`);
      }
    }
    return { code: lines.join('\n'), headers, macros };
  }

  function readEscape(s, i, line, warn) {    // s[i] 是反斜線後的字元；回傳 [byte 值, 新位置]
    const c = s[i];
    const simple = { n: 10, t: 9, r: 13, a: 7, b: 8, f: 12, v: 11, '\\': 92, "'": 39, '"': 34, '?': 63 };
    if (c in simple) return [simple[c], i + 1];
    if (c >= '0' && c <= '7') {
      let j = i, v = 0;
      while (j < i + 3 && s[j] >= '0' && s[j] <= '7') { v = v * 8 + (s.charCodeAt(j) - 48); j++; }
      return [v & 255, j];
    }
    if (c === 'x') {
      let j = i + 1, v = 0;
      while (/[0-9a-fA-F]/.test(s[j] || '')) { v = (v * 16 + parseInt(s[j], 16)) & 255; j++; }
      if (j === i + 1) throw new CErr(line, '\\x 後面要接十六進位數字');
      return [v, j];
    }
    warn(line, `未知的跳脫字元 \\${c}，會被當成 ${c}`);
    return [utf8(c)[0], i + 1];
  }

  function readNumber(s, i, line) {
    const m = /^(0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)([uUlLfF]*)/.exec(s.slice(i, i + 400));
    const body = m[1], suf = m[2], end = i + m[0].length;
    if (/[\w.]/.test(s[end] || '')) throw new CErr(line, `數字的寫法不對：${s.slice(i, end + 1)}…`);
    const isHex = /^0[xX]/.test(body);
    if (!isHex && /[.eE]/.test(body)) {                       // 浮點數
      const v = parseFloat(body);
      if (/^[fF]$/.test(suf)) return { tok: { t: 'num', v: Math.fround(v), ty: T.float, line }, end };
      if (/^[lL]$/.test(suf)) return { tok: { t: 'num', v, ty: T.ldouble, line }, end };
      if (suf) throw new CErr(line, `浮點數後面的 ${suf} 寫法不對`);
      return { tok: { t: 'num', v, ty: T.double, line }, end };
    }
    if (/[fF]/.test(suf)) throw new CErr(line, `整數 ${body} 後面不能加 f；要寫小數可以寫成 ${body}.0f`);
    const sm = /^(u?)(l|ll|L|LL)?(u?)$/i.exec(suf);
    if (!sm || (sm[1] && sm[3]) || (sm[2] && sm[2] !== sm[2].toLowerCase() && sm[2] !== sm[2].toUpperCase())) {
      throw new CErr(line, `整數後面的 ${suf} 寫法不對`);
    }
    if (!isHex && body.length > 1 && body[0] === '0' && /[89]/.test(body)) {
      throw new CErr(line, `${body} 開頭是 0，會被當成八進位，但八進位不能有 8 或 9`);
    }
    const v = isHex ? BigInt(body) : body.length > 1 && body[0] === '0' ? BigInt('0o' + body.slice(1)) : BigInt(body);
    const u = !!(sm[1] || sm[3]), l = sm[2] ? sm[2].length : 0, dec = !isHex && !(body.length > 1 && body[0] === '0');
    let cands;
    if (u) cands = l === 2 ? [T.ullong] : l === 1 ? [T.ulong, T.ullong] : [T.uint, T.ulong, T.ullong];
    else if (dec) cands = l === 2 ? [T.llong] : l === 1 ? [T.long, T.llong] : [T.int, T.long, T.llong];
    else cands = l === 2 ? [T.llong, T.ullong] : l === 1 ? [T.long, T.ulong, T.llong, T.ullong] : [T.int, T.uint, T.long, T.ulong, T.llong, T.ullong];
    const ty = cands.find((t) => v < 2n ** BigInt(t.size * 8 - (t.signed ? 1 : 0)));
    if (!ty) throw new CErr(line, `整數 ${body} 太大了，連 unsigned long long 都裝不下`);
    return { tok: { t: 'num', v, ty, line }, end };
  }

  function tokenize(s, line, warn) {
    const toks = [];
    let i = 0;
    const n = s.length;
    while (i < n) {
      const c = s[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\f' || c === '\v') { i++; continue; }
      if (/[A-Za-z_]/.test(c)) {
        let j = i + 1;
        while (j < n && /\w/.test(s[j])) j++;
        const w = s.slice(i, j);
        if (j < n && s.charCodeAt(j) > 127 && !FULLWIDTH[s[j]]) {
          throw new CErr(line, `名稱「${w}${s[j]}…」裡有中文或特殊符號；變數和函式的名稱只能用英文字母、數字和底線`);
        }
        toks.push({ t: KEYWORDS.has(w) ? 'kw' : 'id', v: w, line });
        i = j; continue;
      }
      if (/\d/.test(c) || (c === '.' && /\d/.test(s[i + 1] || ''))) {
        const r = readNumber(s, i, line);
        toks.push(r.tok); i = r.end; continue;
      }
      if (c === '"' || c === "'") {
        const bytes = [];
        let j = i + 1;
        while (j < n && s[j] !== c && s[j] !== '\n') {
          if (s[j] === '\\') { const [b, k] = readEscape(s, j + 1, line, warn); bytes.push(b); j = k; continue; }
          const cp = s.codePointAt(j), ch = String.fromCodePoint(cp);
          bytes.push(...utf8(ch)); j += ch.length;
        }
        if (s[j] !== c) {
          throw new CErr(line, c === '"' ? '字串少了結尾的雙引號 "' : "字元常數少了結尾的單引號 '");
        }
        if (c === '"') toks.push({ t: 'str', bytes, line });
        else {
          if (bytes.length === 0) throw new CErr(line, "空的字元常數 ''，單引號中間要放一個字元");
          const raw = s.slice(i + 1, j);
          if (/[^\x00-\x7f]/.test(raw)) {
            throw new CErr(line, `字元常數 '${raw}' 裡不能放中文字（一個中文字在 UTF-8 占好幾個 byte）；請改用字串 "${raw}"`);
          }
          let v = 0;
          if (bytes.length > 1) {
            warn(line, `'${raw}' 裡有好幾個字元，單引號只能放一個字元；字串要用雙引號 "${raw}"`);
            for (const b of bytes) v = (v << 8) | b;
          } else v = (bytes[0] << 24) >> 24;                       // char 是有號的
          toks.push({ t: 'num', v: BigInt(v), ty: T.int, line, isChar: true });
        }
        i = j + 1; continue;
      }
      const p = PUNCT.find((x) => s.startsWith(x, i));
      if (p) { toks.push({ t: 'op', v: p, line }); i += p.length; continue; }
      if (FULLWIDTH[c]) {
        throw new CErr(line, `這一行有全形符號「${c}」，請改成半形的 ${FULLWIDTH[c] === ' ' ? '空白' : FULLWIDTH[c]}（切換到英文輸入法再打）`);
      }
      if (c === '#') throw new CErr(line, '# 開頭的指令（例如 #include）要自己寫在一行的最前面');
      const ch = String.fromCodePoint(s.codePointAt(i));
      if (s.charCodeAt(i) > 127) throw new CErr(line, `程式裡出現了「${ch}」；中文只能寫在註解或字串裡`);
      throw new CErr(line, `看不懂的符號「${ch}」`);
    }
    return toks;
  }

  // 把 #define 的名字換成它的內容（遞迴展開，但同一個名字不會無限展開）
  function expand(toks, macros) {
    const out = [];
    const walk = (list, line, active) => {
      for (const tk of list) {
        if (tk.t === 'id' && macros.has(tk.v) && !active.has(tk.v)) {
          active.add(tk.v);
          walk(macros.get(tk.v).toks, line == null ? tk.line : line, active);
          active.delete(tk.v);
        } else out.push(line == null ? tk : Object.assign({}, tk, { line }));
      }
    };
    walk(toks, null, new Set());
    return out;
  }

  function lex(src, warn) {
    const pp = preprocess(src, warn);
    const toks = expand(tokenize(pp.code, 1, warn), pp.macros);
    const lastLine = pp.code.split('\n').length;
    toks.push({ t: 'eof', v: '', line: lastLine });
    return { toks, headers: pp.headers, macros: pp.macros };
  }

  Object.assign(CI, { lex, HEADERS });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 遞迴下降語法分析：宣告、型態、語句。運算式在 parser-expr.js。
// 每個 AST 節點都帶 line（所在行號）。
(function (CI) {
  'use strict';
  const { CErr, T, TYPEDEFS, ptr, fn } = CI;

  const TYPE_KW = new Set(['int', 'char', 'short', 'long', 'signed', 'unsigned', 'float', 'double', 'void', '_Bool',
    'const', 'static', 'extern', 'register', 'volatile', 'auto', 'inline', 'restrict', 'struct', 'union', 'enum', 'typedef']);
  const UNSUPPORTED_KW = { struct: 'struct', union: 'union', enum: 'enum', typedef: 'typedef', goto: 'goto' };

  function Parser(lx) {
    this.toks = lx.toks;
    this.i = 0;
    this.typedefUses = [];                   // 用到 bool、size_t 這類名字的位置（之後檢查有沒有 include）
  }
  const P = Parser.prototype;

  P.peek = function (k) { return this.toks[Math.min(this.i + (k || 0), this.toks.length - 1)]; };
  P.next = function () { const t = this.toks[this.i]; if (this.i < this.toks.length - 1) this.i++; return t; };
  P.prev = function () { return this.toks[Math.max(this.i - 1, 0)]; };
  P.is = function (v, k) { const t = this.peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; };
  P.accept = function (v) { if (this.is(v)) { return this.next(); } return null; };
  P.fail = function (tok, msg) { throw new CErr(tok.line, msg); };
  P.describe = function (tok) {
    if (tok.t === 'eof') return '程式的結尾';
    if (tok.t === 'str') return '字串';
    if (tok.t === 'num') return tok.isChar ? '字元常數' : '數字';
    return `「${tok.v}」`;
  };
  P.expect = function (v, what) {
    if (this.is(v)) return this.next();
    const tok = this.peek();
    if (v === ';') {
      if (tok.t === 'op' && (tok.v === ')' || tok.v === ']')) {
        this.fail(tok, `這裡多了一個 ${tok.v}，括號沒有成對`);
      }
      const prev = this.prev();
      throw new CErr(prev.line, `這一行結尾好像少了分號 ;（在 ${this.describe(prev)} 後面）`);
    }
    if (v === ')' || v === ']' || v === '}') {
      this.fail(tok, `${what ? what + '：' : ''}這裡應該要有 ${v}，但看到的是 ${this.describe(tok)}。括號有成對嗎？`);
    }
    this.fail(tok, `${what ? what + '：' : ''}這裡應該要有 ${v}，但看到的是 ${this.describe(tok)}`);
  };
  P.ident = function (what) {
    const tok = this.peek();
    if (tok.t === 'id') return this.next();
    if (tok.t === 'kw') this.fail(tok, `「${tok.v}」是 C 的保留字，不能拿來當${what || '名稱'}`);
    this.fail(tok, `這裡應該要有${what || '名稱'}，但看到的是 ${this.describe(tok)}`);
  };

  P.isTypeStart = function (k) {
    const t = this.peek(k);
    if (t.t === 'kw') return TYPE_KW.has(t.v);
    return t.t === 'id' && Object.prototype.hasOwnProperty.call(TYPEDEFS, t.v);
  };

  // ---------- 型態 ----------
  P.declSpecs = function () {
    const start = this.peek();
    const c = { signed: 0, unsigned: 0, long: 0, short: 0, int: 0, char: 0, float: 0, double: 0, void: 0, bool: 0 };
    let isConst = false, isStatic = false, named = null, any = false;
    for (;;) {
      const t = this.peek();
      if (t.t === 'kw' && UNSUPPORTED_KW[t.v]) this.fail(t, `練習環境暫不支援 ${t.v}`);
      if (t.t === 'kw' && TYPE_KW.has(t.v)) {
        this.next(); any = true;
        if (t.v === 'const') isConst = true;
        else if (t.v === 'static') isStatic = true;
        else if (t.v === '_Bool') c.bool++;
        else if (t.v in c) c[t.v]++;
        continue;
      }
      if (t.t === 'id' && !named && Object.prototype.hasOwnProperty.call(TYPEDEFS, t.v) &&
          !(c.int || c.char || c.float || c.double || c.void || c.bool || c.long || c.short || c.signed || c.unsigned)) {
        this.next(); any = true; named = t;
        this.typedefUses.push({ name: t.v, line: t.line });
        continue;
      }
      break;
    }
    if (!any) return null;
    const bad = () => this.fail(start, '型態的寫法不對');
    let base;
    if (named) base = TYPEDEFS[named.v].ty;
    else if (c.void) base = T.void;
    else if (c.bool) base = T.bool;
    else if (c.float) { if (c.long || c.signed || c.unsigned) bad(); base = T.float; }
    else if (c.double) { if (c.signed || c.unsigned || c.long > 1) bad(); base = c.long ? T.ldouble : T.double; }
    else if (c.char) { if (c.long || c.short) bad(); base = c.unsigned ? T.uchar : c.signed ? T.schar : T.char; }
    else if (c.short) { if (c.long) bad(); base = c.unsigned ? T.ushort : T.short; }
    else if (c.long >= 3) this.fail(start, 'long 最多只能寫兩個（long long）');
    else if (c.long === 2) base = c.unsigned ? T.ullong : T.llong;
    else if (c.long === 1) base = c.unsigned ? T.ulong : T.long;
    else if (c.int || c.signed || c.unsigned) base = c.unsigned ? T.uint : T.int;
    else this.fail(start, isConst || isStatic ? `${isConst ? 'const' : 'static'} 後面要接型態，例如 const int` : '型態的寫法不對');
    if (c.signed && c.unsigned) this.fail(start, 'signed 和 unsigned 不能同時寫');
    if ((c.void || c.bool || c.float || c.double) && (c.signed || c.unsigned)) bad();
    return { base, isConst, isStatic, line: start.line };
  };

  // 宣告子：* 名稱 [n] (參數)；abstract = 可以沒有名稱（轉型、sizeof、原型的參數）
  P.declarator = function (base, abstract) {
    let ty = base, ptrConst = false;
    while (this.accept('*')) { ty = ptr(ty); ptrConst = false; while (this.accept('const') || this.accept('restrict')) ptrConst = true; }
    if (this.is('(') && (this.is('*', 1) || this.peek(1).t === 'id' && this.is(')', 2) && !abstract)) {
      this.fail(this.peek(), '練習環境暫不支援函式指標或括號包住的宣告');
    }
    let name = null;
    if (this.peek().t === 'id' && !this.isTypeStart(0)) name = this.next();
    else if (!abstract) this.ident('變數名稱');
    const sizes = [];
    let params = null;
    for (;;) {
      if (this.is('[')) {
        const lb = this.next();
        const len = this.is(']') ? null : this.expr();
        this.expect(']', '陣列大小');
        sizes.push({ len, line: lb.line });
      } else if (this.is('(') && !params && sizes.length === 0) {
        params = this.paramList();
      } else break;
    }
    for (let k = sizes.length - 1; k >= 0; k--) {
      ty = { k: 'arr', of: ty, len: undefined, lenExpr: sizes[k].len, line: sizes[k].line };
    }
    if (params) ty = fn(ty, params.types, params.variadic, params.unspec);
    return { name: name ? name.v : null, line: name ? name.line : this.peek().line, ty, params, ptrConst };
  };

  P.paramList = function () {
    const open = this.expect('(');
    if (this.accept(')')) return { types: [], names: [], unspec: true };
    if (this.is('void') && this.is(')', 1)) { this.next(); this.next(); return { types: [], names: [] }; }
    const types = [], names = [];
    let variadic = false;
    do {
      if (this.accept('...')) { variadic = true; break; }
      const sp = this.declSpecs();
      if (!sp) this.fail(this.peek(), `參數前面要寫型態，例如 int ${this.peek().t === 'id' ? this.peek().v : 'x'}`);
      const d = this.declarator(sp.base, true);
      types.push(d.ty);
      names.push({ name: d.name, line: d.line, isConst: sp.isConst });
    } while (this.accept(','));
    this.expect(')', `函式的參數列（第 ${open.line} 行開始）`);
    return { types, names, variadic };
  };

  P.typeName = function () {                 // 轉型或 sizeof 裡的型態
    const sp = this.declSpecs();
    const d = this.declarator(sp.base, true);
    if (d.name) this.fail(this.peek(), '型態裡不應該有名稱');
    return d.ty;
  };

  // ---------- 初始值 ----------
  P.initializer = function () {
    if (this.is('{')) {
      const open = this.next();
      const items = [];
      while (!this.is('}')) {
        if (this.is('[') || this.is('.')) this.fail(this.peek(), '練習環境暫不支援指定位置的初始值（[i] = …）');
        items.push(this.initializer());
        if (!this.accept(',')) break;
      }
      this.expect('}', `初始值列表（第 ${open.line} 行的 { ）`);
      return { k: 'init', items, line: open.line };
    }
    return this.assign();
  };

  // ---------- 宣告 ----------
  P.declaration = function (sp, top) {
    const decls = [];
    do {
      const d = this.declarator(sp.base, false);
      if (d.ty.k === 'fn') {
        if (top && this.is('{')) {
          if (decls.length) this.fail(this.peek(), '函式定義要自己獨立寫');
          const body = this.block();
          return { k: 'fndef', name: d.name, ty: d.ty, params: d.params, body, line: d.line, isStatic: sp.isStatic };
        }
        decls.push({ k: 'fndecl', name: d.name, ty: d.ty, params: d.params, line: d.line });
        continue;
      }
      const init = this.accept('=') ? this.initializer() : null;
      decls.push({ k: 'var', name: d.name, ty: d.ty, init, line: d.line, isConst: sp.isConst, isStatic: sp.isStatic });
    } while (this.accept(','));
    this.expect(';');
    return { k: 'decl', decls, line: sp.line };
  };

  P.program = function () {
    const items = [];
    while (this.peek().t !== 'eof') {
      if (this.accept(';')) continue;
      const tok = this.peek();
      if (tok.t === 'op' && tok.v === '}') this.fail(tok, '多了一個 }，前面的大括號沒有成對');
      const sp = this.declSpecs();
      if (!sp) {
        if (tok.t === 'id' && this.is('(', 1)) {
          this.fail(tok, `函式 ${tok.v} 前面要寫回傳型態，例如 int ${tok.v}()`);
        }
        this.fail(tok, `這裡應該是函式或全域變數的宣告，但看到的是 ${this.describe(tok)}。程式碼要寫在函式（例如 main）的大括號裡`);
      }
      items.push(this.declaration(sp, true));
    }
    return { k: 'program', items };
  };

  // ---------- 語句 ----------
  P.block = function () {
    const open = this.expect('{');
    const items = [];
    while (!this.is('}')) {
      if (this.peek().t === 'eof') this.fail(open, '這個 { 沒有對應的 }');
      items.push(this.statement());
    }
    const close = this.next();
    return { k: 'block', items, line: open.line, endLine: close.line };
  };

  P.statement = function () {
    const tok = this.peek();
    if (tok.t === 'kw' && UNSUPPORTED_KW[tok.v]) this.fail(tok, `練習環境暫不支援 ${tok.v}`);
    if (tok.t === 'op' && tok.v === '{') return this.block();
    if (tok.t === 'op' && tok.v === ';') { this.next(); return { k: 'empty', line: tok.line }; }
    if (this.isTypeStart(0)) {
      const sp = this.declSpecs();
      return this.declaration(sp, false);
    }
    if (tok.t === 'id' && this.is(':', 1)) this.fail(tok, '練習環境暫不支援標籤（label）和 goto');
    if (tok.t === 'kw') {
      const line = tok.line;
      switch (tok.v) {
        case 'if': {
          this.next(); this.expect('(', 'if 後面');
          const c = this.expr(); this.expect(')', 'if 的條件');
          const t = this.statement();
          const f = this.accept('else') ? this.statement() : null;
          return { k: 'if', c, t, f, line };
        }
        case 'else': this.fail(tok, 'else 前面找不到對應的 if（if 的大括號有成對嗎？）'); break;
        case 'while': {
          this.next(); this.expect('(', 'while 後面');
          const c = this.expr(); this.expect(')', 'while 的條件');
          return { k: 'while', c, body: this.statement(), line };
        }
        case 'do': {
          this.next();
          const body = this.statement();
          if (!this.accept('while')) this.fail(this.peek(), 'do { … } 後面要接 while (條件);');
          this.expect('(', 'while 後面');
          const c = this.expr(); this.expect(')', 'while 的條件'); this.expect(';');
          return { k: 'do', body, c, line, endLine: this.prev().line };
        }
        case 'for': {
          this.next(); this.expect('(', 'for 後面');
          let init = null;
          if (this.isTypeStart(0)) init = this.declaration(this.declSpecs(), false);
          else { if (!this.is(';')) init = { k: 'expr', e: this.expr(), line }; this.expect(';'); }
          const c = this.is(';') ? null : this.expr();
          this.expect(';');
          const step = this.is(')') ? null : this.expr();
          this.expect(')', 'for 的括號');
          return { k: 'for', init, c, step, body: this.statement(), line };
        }
        case 'switch': {
          this.next(); this.expect('(', 'switch 後面');
          const e = this.expr(); this.expect(')', 'switch 的括號');
          return { k: 'switch', e, body: this.statement(), line };
        }
        case 'case': {
          this.next();
          const v = this.cond();
          this.expect(':', 'case 後面');
          return { k: 'case', v, line };
        }
        case 'default': this.next(); this.expect(':', 'default 後面'); return { k: 'default', line };
        case 'break': this.next(); this.expect(';'); return { k: 'break', line };
        case 'continue': this.next(); this.expect(';'); return { k: 'continue', line };
        case 'return': {
          this.next();
          const e = this.is(';') ? null : this.expr();
          this.expect(';');
          return { k: 'return', e, line };
        }
      }
    }
    const e = this.expr();
    this.expect(';');
    return { k: 'expr', e, line: tok.line };
  };

  function parse(lx) {
    const p = new Parser(lx);
    const prog = p.program();
    prog.typedefUses = p.typedefUses;
    return prog;
  }

  Object.assign(CI, { Parser, parse });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 運算式的語法分析（運算子優先順序由低到高：逗號 → 指定 → ?: → || → … → 一元 → 後置 → 基本）。
(function (CI) {
  'use strict';
  const P = CI.Parser.prototype;

  const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=']);
  const BIN_PREC = {
    '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
    '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
  };

  P.expr = function () {
    let e = this.assign();
    while (this.is(',')) {
      const op = this.next();
      e = { k: 'comma', l: e, r: this.assign(), line: op.line };
    }
    return e;
  };

  P.assign = function () {
    const l = this.cond();
    const t = this.peek();
    if (t.t === 'op' && ASSIGN_OPS.has(t.v)) {
      this.next();
      return { k: 'assign', op: t.v, l, r: this.assign(), line: t.line };
    }
    return l;
  };

  P.cond = function () {
    const c = this.binary(1);
    if (this.is('?')) {
      const q = this.next();
      const a = this.expr();
      this.expect(':', '?: 運算子');
      return { k: 'cond', c, a, b: this.cond(), line: q.line };
    }
    return c;
  };

  P.binary = function (minPrec) {
    let l = this.unary();
    for (;;) {
      const t = this.peek();
      const prec = t.t === 'op' ? BIN_PREC[t.v] : undefined;
      if (prec === undefined || prec < minPrec) return l;
      this.next();
      const r = this.binary(prec + 1);
      l = { k: 'bin', op: t.v, l, r, line: t.line };
    }
  };

  P.unary = function () {
    const t = this.peek();
    if (t.t === 'op') {
      if (t.v === '++' || t.v === '--') { this.next(); return { k: 'pre', op: t.v, e: this.unary(), line: t.line }; }
      if (['-', '+', '!', '~', '*', '&'].includes(t.v)) {
        this.next();
        return { k: 'un', op: t.v, e: this.unary(), line: t.line };
      }
      if (t.v === '(' && this.isTypeStart(1)) {
        this.next();
        const ty = this.typeName();
        this.expect(')', '轉型');
        if (this.is('{')) this.fail(this.peek(), '練習環境暫不支援複合常值（(型態){ … }）');
        return { k: 'cast', to: ty, e: this.unary(), line: t.line };
      }
    }
    if (t.t === 'kw' && t.v === 'sizeof') {
      this.next();
      if (this.is('(') && this.isTypeStart(1)) {
        this.next();
        const ty = this.typeName();
        this.expect(')', 'sizeof');
        return { k: 'sizeof', ty, line: t.line };
      }
      return { k: 'sizeof', e: this.unary(), line: t.line };
    }
    return this.postfix();
  };

  P.postfix = function () {
    let e = this.primary();
    for (;;) {
      const t = this.peek();
      if (t.t !== 'op') return e;
      if (t.v === '[') {
        this.next();
        const i = this.expr();
        this.expect(']', '陣列索引');
        e = { k: 'index', a: e, i, line: t.line };
      } else if (t.v === '(') {
        this.next();
        const args = [];
        if (!this.is(')')) {
          do { args.push(this.assign()); } while (this.accept(','));
        }
        this.expect(')', '函式呼叫的括號');
        e = { k: 'call', f: e, args, line: t.line };
      } else if (t.v === '++' || t.v === '--') {
        this.next();
        e = { k: 'post', op: t.v, e, line: t.line };
      } else if (t.v === '.' || t.v === '->') {
        this.fail(t, `練習環境暫不支援 struct（${t.v} 運算子）`);
      } else return e;
    }
  };

  P.primary = function () {
    const t = this.peek();
    if (t.t === 'num') { this.next(); return { k: 'num', v: t.v, ty: t.ty, line: t.line, isChar: !!t.isChar }; }
    if (t.t === 'str') {
      const bytes = [];
      while (this.peek().t === 'str') bytes.push(...this.next().bytes);   // 相鄰的字串會接在一起
      return { k: 'str', bytes, line: t.line };
    }
    if (t.t === 'id') { this.next(); return { k: 'id', name: t.v, line: t.line }; }
    if (t.t === 'op' && t.v === '(') {
      this.next();
      const e = this.expr();
      this.expect(')', `括號（第 ${t.line} 行的 ( ）`);
      e.paren = true;
      return e;
    }
    if (t.t === 'kw' && this.isTypeStart(0)) {
      this.fail(t, `這裡不能宣告變數（看到了型態「${t.v}」）。變數要先在前面宣告好，這裡直接用名字就好`);
    }
    if (t.t === 'eof') this.fail(t, '程式在這裡突然結束了，是不是少了 } 或 ;？');
    if (t.t === 'op' && (t.v === ')' || t.v === ';' || t.v === ',' || t.v === ']' || t.v === '}')) {
      this.fail(t, `這裡少了值或運算元：在 ${this.describe(t)} 前面應該要有東西`);
    }
    this.fail(t, `這裡應該要有值或變數，但看到的是 ${this.describe(t)}`);
  };
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

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

// scanf：照 C 的規則從輸入讀資料。輸入是 binary string（UTF-8 bytes），目前位置是 ctx.ip。
(function (CI) {
  'use strict';
  const { T } = CI;

  const isWs = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\v' || c === '\f';
  const INT_STORE = { '': [T.int, T.uint], hh: [T.schar, T.uchar], h: [T.short, T.ushort], l: [T.long, T.ulong],
    z: [T.long, T.ulong], j: [T.long, T.ulong], t: [T.long, T.ulong], ll: [T.llong, T.ullong] };
  const MAX_S = 2n ** 63n - 1n, MIN_S = -(2n ** 63n), MAX_U = 2n ** 64n - 1n;

  function skipWs(ctx) {
    const s = ctx.input;
    while (ctx.ip < s.length && isWs(s[ctx.ip])) ctx.ip++;
  }

  // 讀一個整數；回傳 BigInt，讀不到數字回傳 null
  function readInt(ctx, conv, width) {
    const s = ctx.input;
    let i = ctx.ip;
    const end = Math.min(s.length, i + width);
    let neg = false;
    if (i < end && (s[i] === '+' || s[i] === '-')) { neg = s[i] === '-'; i++; }
    let base = conv === 'x' || conv === 'X' ? 16 : conv === 'o' ? 8 : 10;
    if (conv === 'i' && i < end && s[i] === '0') {
      base = (s[i + 1] === 'x' || s[i + 1] === 'X') && i + 2 < end && /[0-9a-fA-F]/.test(s[i + 2]) ? 16 : 8;
    }
    if (base === 16 && s[i] === '0' && (s[i + 1] === 'x' || s[i + 1] === 'X') && i + 2 < end && /[0-9a-fA-F]/.test(s[i + 2])) i += 2;
    const digit = base === 16 ? /[0-9a-fA-F]/ : base === 8 ? /[0-7]/ : /[0-9]/;
    const start = i;
    while (i < end && digit.test(s[i])) i++;
    if (i === start) { ctx.ip = i; return null; }
    let v = BigInt((base === 16 ? '0x' : base === 8 ? '0o' : '') + s.slice(start, i));
    ctx.ip = i;
    if (neg) v = -v;
    return v;
  }

  function readFloat(ctx, width) {
    const s = ctx.input.slice(ctx.ip, ctx.ip + Math.min(width, 400));
    const m = /^[+-]?(?:inf(?:inity)?|nan|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/i.exec(s);
    if (!m) return null;
    ctx.ip += m[0].length;
    const t = m[0].toLowerCase();
    if (/inf/.test(t)) return t[0] === '-' ? -Infinity : Infinity;
    if (/nan/.test(t)) return NaN;
    return parseFloat(m[0]);
  }

  function setMatcher(set) {
    let neg = false, i = 0;
    if (set[0] === '^') { neg = true; i = 1; }
    const chars = new Set(), ranges = [];
    for (; i < set.length; i++) {
      if (set[i + 1] === '-' && i + 2 < set.length) { ranges.push([set.charCodeAt(i), set.charCodeAt(i + 2)]); i += 2; }
      else chars.add(set[i]);
    }
    return (c) => {
      const code = c.charCodeAt(0);
      const hit = chars.has(c) || ranges.some(([a, b]) => code >= a && code <= b);
      return neg ? !hit : hit;
    };
  }

  function scanf(ctx, items, args, tys, line) {
    const s = ctx.input;
    let done = 0, ai = 0;
    const fail = () => (done === 0 && ctx.ip >= s.length ? -1 : done);
    for (const it of items) {
      if (it.ws) { skipWs(ctx); continue; }
      if (it.lit !== undefined) {
        for (const ch of it.lit) {
          if (ctx.ip >= s.length) return fail();
          if (s[ctx.ip] !== ch) return done;
          ctx.ip++;
        }
        continue;
      }
      if (it.bad !== undefined) return done;
      const sp = it.spec, c = sp.conv, width = sp.width || Infinity;
      if (c !== 'c' && c !== '[') skipWs(ctx);
      if (ctx.ip >= s.length) return fail();
      const argNo = ai + 2;
      const target = () => {
        if (ai >= args.length) throw new CI.RErr(line, `scanf 的格式「${sp.text}」沒有對應的變數：格式裡的 % 比後面的參數多`);
        const p = args[ai], t = tys[ai];
        ai++;
        return [p, t];
      };
      if ('diuxXo'.includes(c)) {
        let v = readInt(ctx, c, width);
        if (v === null) return done;
        if (sp.suppress) continue;
        const signed = c === 'd' || c === 'i';
        if (signed) v = v > MAX_S ? MAX_S : v < MIN_S ? MIN_S : v;
        else { const a = v < 0n ? -v : v; v = a > MAX_U ? (v < 0n ? 1n : MAX_U) : BigInt.asUintN(64, v); }
        const ty = INT_STORE[sp.len][signed ? 0 : 1];
        const [p, t] = target();
        CI.storeVia(ctx, p, t, CI.makeConv(T.llong, ty)(BigInt.asIntN(64, v)), ty, line, argNo);
      } else if ('feEgG'.includes(c)) {
        const v = readFloat(ctx, width);
        if (v === null) return done;
        if (sp.suppress) continue;
        const ty = sp.len === 'l' ? T.double : sp.len === 'L' ? T.ldouble : T.float;
        const [p, t] = target();
        CI.storeVia(ctx, p, t, ty.size === 4 ? Math.fround(v) : v, ty, line, argNo);
      } else if (c === 's' || c === '[') {
        const ok = c === 's' ? (ch) => !isWs(ch) : setMatcher(sp.set || '');
        const start = ctx.ip;
        while (ctx.ip < s.length && ctx.ip - start < width && ok(s[ctx.ip])) ctx.ip++;
        if (ctx.ip === start) return done;
        if (sp.suppress) continue;
        const [p, t] = target();
        CI.storeBytes(ctx, p, t, s.slice(start, ctx.ip), true, line, argNo, 'scanf');
      } else if (c === 'c') {
        const n = sp.width || 1;
        if (ctx.ip + n > s.length) { ctx.ip = s.length; return fail(); }
        const bytes = s.slice(ctx.ip, ctx.ip + n);
        ctx.ip += n;
        if (sp.suppress) continue;
        const [p, t] = target();
        CI.storeBytes(ctx, p, t, bytes, false, line, argNo, 'scanf');
      }
      done++;
    }
    return done;
  }

  Object.assign(CI, { scanf });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

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

// 語意分析（上半）：符號表、宣告、初始值、語句。運算式在 checker-expr.js。
// 檢查完會產生 prog：{ globals, fns, strings, main }，交給 runtime 執行。
(function (CI) {
  'use strict';
  const { CErr, T, TYPEDEFS, ptr, isInt, isPtr, isScalar, sameType, typeName, scalarOf } = CI;

  function Checker(lx, warnings) {
    this.headers = lx.headers;
    this.warnings = warnings;
    this.scopes = [new Map()];
    this.strings = [];
    this.globals = [];               // { sym, decl }：依序在 main 之前初始化
    this.nGlobals = 0;
    this.fns = new Map();
    this.fn = null;                  // 目前在檢查的函式
    this.loops = 0;
    this.breaks = 0;
    this.called = new Map();         // 被呼叫過的函式名稱 → 第一次呼叫的行號
  }
  const C = Checker.prototype;

  C.err = function (line, msg) { throw new CErr(line, msg); };
  C.warn = function (line, msg) { this.warnings.push({ line, msg }); };

  // ---------- 符號表 ----------
  C.lookup = function (name) {
    for (let i = this.scopes.length - 1; i >= 0; i--) { const s = this.scopes[i].get(name); if (s) return s; }
    return null;
  };
  C.declare = function (sym) {
    const scope = this.scopes[this.scopes.length - 1];
    const old = scope.get(sym.name);
    if (old && !(old.k === 'fn' && sym.k === 'fn')) {
      this.err(sym.line, `「${sym.name}」重複宣告了（第 ${old.line} 行已經宣告過）`);
    }
    if (!old && this.scopes.length > 1 && this.scopes[0].get(sym.name) && this.scopes[0].get(sym.name).k === 'fn') {
      this.warn(sym.line, `變數「${sym.name}」和函式同名，在這個範圍裡就不能呼叫函式 ${sym.name} 了`);
    }
    scope.set(sym.name, sym);
    return sym;
  };
  C.newSlot = function () { return this.fn.nslots++; };
  C.newVar = function (name, ty, line, opts) {
    const sym = Object.assign({ k: 'var', name, ty, line, g: false, slot: 0, isConst: false }, opts || {});
    if (sym.g) sym.slot = this.nGlobals++;
    else sym.slot = this.newSlot();
    return sym;
  };

  // 所有可見的名字（拼錯字時找相近的）
  C.visibleNames = function () {
    const names = new Set();
    for (const s of this.scopes) for (const k of s.keys()) names.add(k);
    for (const [k, lib] of Object.entries(CI.LIB)) if (this.hasHeader(lib.h)) names.add(k);
    for (const [k, c] of Object.entries(CI.CONST)) if (this.hasHeader(c.h)) names.add(k);
    return [...names];
  };
  C.hasHeader = function (h) { return (Array.isArray(h) ? h : [h]).some((x) => this.headers.has(x)); };
  C.suggest = function (name) {
    const dist = (a, b) => {
      const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
      for (let j = 1; j <= b.length; j++) d[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
      }
      return d[a.length][b.length];
    };
    let best = null, bd = Infinity;
    for (const c of this.visibleNames()) {
      const d = c.toLowerCase() === name.toLowerCase() ? 0.5 : dist(name, c);
      if (d < bd) { bd = d; best = c; }
    }
    return best && bd <= (name.length <= 3 ? 1 : 2) ? best : null;
  };

  // ---------- 型態解析（陣列大小） ----------
  // kind：'global' | 'local' | 'param' | 'cast'；inner = 是不是內層的維度。VLA 的大小算式放進 vla 清單
  C.resolveType = function (ty, kind, line, vla, hasInit, inner) {
    if (ty.k === 'ptr') return ptr(this.resolveType(ty.to, kind === 'param' ? 'param' : 'cast', line, vla, false, true));
    if (ty.k !== 'arr') return ty;
    const of = this.resolveType(ty.of, kind, line, vla, false, true);
    if (of.k === 'void') this.err(line, '不能宣告 void 的陣列');
    if (ty.lenExpr == null) {
      if (!inner && (kind === 'param' || hasInit)) return { k: 'arr', of, len: null, size: null };
      this.err(line, inner ? '多維陣列只有第一個維度可以省略大小，例如 int a[][3]' :
        '陣列要寫大小，例如 int a[10];（只有在給初始值的時候可以省略大小）');
    }
    const e = this.rv(ty.lenExpr);
    if (!isInt(e.ty)) this.err(line, `陣列的大小必須是整數，但這裡是 ${typeName(e.ty)}`);
    if (this.isConst(e)) {
      const n = Number(CI.evalConst(e));
      if (n <= 0) this.err(line, `陣列的大小必須大於 0，但這裡是 ${n}`);
      if (n > 50000000) this.err(line, `陣列太大了（${n} 格），練習環境最多 5000 萬格`);
      return CI.arr(of, n);
    }
    if (kind === 'global') this.err(line, '全域陣列的大小必須是常數（例如 100 或 #define 的名字）');
    if (kind === 'cast') this.err(line, '練習環境不支援這種寫法（大小是變數的陣列型態）');
    const slot = this.newSlot();
    vla.push({ slot, e: this.conv(e, T.long), line });
    return { k: 'arr', of, len: null, vla: slot, size: null };
  };
  C.hasVla = function (t) { while (t.k === 'arr') { if (t.vla !== undefined) return true; t = t.of; } return false; };

  // ---------- 初始值 ----------
  // 回傳 { k: 'list', items: [{ off, e }] } 或 { k: 'str', bytes }；必要時補上陣列長度
  C.arrayInit = function (ty, init, line) {
    const leaf = scalarOf(ty);
    const isCharArr = (t) => t.k === 'arr' && t.of.k === 'int' && t.of.size === 1;
    if (init.k === 'str' || (isCharArr(ty) && init.k === 'init' && init.items.length === 1 && init.items[0].k === 'str')) {
      const s = init.k === 'str' ? init : init.items[0];
      if (ty.of.k !== 'int' || ty.of.size !== 1) this.err(line, `${typeName(ty)} 不能用字串當初始值，只有 char 陣列可以`);
      const bytes = s.bytes.concat([0]);
      if (ty.len == null) ty.len = bytes.length;
      else if (bytes.length - 1 > ty.len) this.warn(line, `字串有 ${bytes.length - 1} 個字元，但陣列只有 ${ty.len} 格，放不下的部分會被丟掉`);
      ty.size = ty.len;
      return { k: 'str', bytes: bytes.slice(0, ty.len) };
    }
    if (init.k !== 'init') this.err(line, `陣列的初始值要用大括號，例如 ${typeName(leaf)} a[3] = {1, 2, 3};`);
    const items = [];
    const cellsOf = (t) => (t.k === 'arr' ? t.len * cellsOf(t.of) : 1);
    const fill = (t, list, base) => {           // list：大括號裡的項目；回傳用掉幾個
      const sub = t.of, step = sub.k === 'arr' ? cellsOf(sub) : 1;
      let idx = 0, e = 0;
      for (; idx < list.length && (t.len == null || e < t.len); e++) {
        const it = list[idx];
        if (sub.k === 'arr') {
          const str = it.k === 'str' ? it : it.k === 'init' && it.items.length === 1 && it.items[0].k === 'str' ? it.items[0] : null;
          if (str && isCharArr(sub)) {                // 二維 char 陣列：每一列放一個字串
            if (str.bytes.length > sub.len) this.warn(line, `字串太長，放不進 ${sub.len} 格`);
            str.bytes.slice(0, sub.len).forEach((b, j) => {
              items.push({ off: base + e * step + j, e: { k: 'num', v: (b << 24) >> 24, ty: T.char, line } });
            });
            idx++;
          } else if (it.k === 'init') { fill(sub, it.items, base + e * step); idx++; }
          else idx += fill(sub, list.slice(idx), base + e * step);
        } else {
          let x = it;
          if (x.k === 'init') { if (x.items.length !== 1) this.err(line, '一個格子只能給一個初始值'); x = x.items[0]; }
          items.push({ off: base + e, e: this.assignConv(this.rv(x), sub, '初始值') });
          idx++;
        }
      }
      if (t.len == null) { t.len = e; t.size = e * (sub.size || 0); }
      return idx;
    };
    const used = fill(ty, init.items, 0);
    if (used < init.items.length) this.warn(line, `初始值太多了：陣列 ${typeName(ty)} 放不下 ${init.items.length} 個值，多的會被丟掉`);
    if (ty.len === 0) this.err(line, '陣列的大小必須大於 0');
    let t = ty;
    while (t.k === 'arr') { t.size = t.len * (t.of.k === 'arr' ? t.of.size : t.of.size); t = t.of; }
    return { k: 'list', items };
  };

  // ---------- 宣告 ----------
  C.varDecl = function (d, isGlobal) {
    const vla = [];
    if (d.ty.k === 'void') this.err(d.line, `變數 ${d.name} 不能是 void 型態（void 代表「沒有值」）`);
    const isStatic = isGlobal || d.isStatic;
    const ty = this.resolveType(d.ty, isGlobal ? 'global' : 'local', d.line, vla, !!d.init);
    if (vla.length && d.isStatic) this.err(d.line, 'static 陣列的大小必須是常數');
    const sym = this.newVar(d.name, ty, d.line, { g: isStatic, isConst: d.isConst, isStaticLocal: !isGlobal && d.isStatic });
    this.declare(sym);
    const out = { sym, ty, vla, init: null, line: d.line };
    if (d.init) {
      if (vla.length) this.err(d.line, '大小是變數的陣列（VLA）不能在宣告時給初始值，請在宣告之後用迴圈一格一格設定');
      if (ty.k === 'arr') out.init = this.arrayInit(ty, d.init, d.line);
      else {
        let x = d.init;
        if (x.k === 'init') { if (x.items.length !== 1) this.err(d.line, `${d.name} 不是陣列，不能用大括號給好幾個值`); x = x.items[0]; }
        if (ty.k === 'int' && ty.size === 1 && x.k === 'str') this.err(d.line, `char 只能放一個字元（要用單引號 'a'）；要放字串請宣告成陣列：char ${d.name}[100] = "...";`);
        out.init = { k: 'expr', e: this.assignConv(this.rv(x), ty, `${d.name} 的初始值`) };
      }
      if (isStatic) this.checkStaticInit(out.init, d.line, isGlobal);
    } else if (d.isConst && !isStatic) {
      this.warn(d.line, `const 變數 ${d.name} 沒有給初始值，之後也不能再改它`);
    }
    if (isStatic) this.globals.push(out);
    return out;
  };
  C.checkStaticInit = function (init, line, isGlobal) {
    const ok = (e) => this.isConst(e) || (e.k === 'decay' && e.e.k === 'str') || (e.k === 'num') ||
      (e.k === 'conv' && ok(e.e)) || ((e.k === 'addr' || e.k === 'decay') && e.e.k === 'var' && e.e.sym.g);
    const list = init.k === 'expr' ? [init.e] : init.k === 'list' ? init.items.map((x) => x.e) : [];
    for (const e of list) {
      if (!ok(e)) this.err(line, isGlobal ? '全域變數的初始值必須是常數（不能用變數或函式呼叫）' : 'static 變數的初始值必須是常數');
    }
  };

  C.fnDecl = function (d, def) {
    const params = d.params || { types: [], names: [] };
    let sym = this.scopes[0].get(d.name);
    if (sym && sym.k !== 'fn') this.err(d.line, `「${d.name}」已經是變數的名字了，不能再當函式名稱`);
    if (CI.LIB[d.name] && this.hasHeader(CI.LIB[d.name].h)) {
      this.err(d.line, `${d.name} 是函式庫（<${[].concat(CI.LIB[d.name].h)[0]}>）裡已經有的函式，請換一個名字`);
    }
    const ty = Object.assign({}, d.ty, { params: d.ty.params.map((t) => this.paramType(t)) });
    if (sym) {
      const same = sameType(sym.ty.ret, ty.ret) && (sym.ty.unspec || ty.unspec ||
        (sym.ty.params.length === ty.params.length && sym.ty.params.every((p, i) => sameType(p, ty.params[i]))));
      if (!same) this.err(d.line, `函式 ${d.name} 的寫法和第 ${sym.line} 行的宣告不一樣（回傳型態或參數不同）`);
      if (def && sym.info.defined) this.err(d.line, `函式 ${d.name} 定義了兩次（第 ${sym.info.line} 行已經有了）`);
      if (!ty.unspec) sym.ty = ty;
    } else {
      sym = { k: 'fn', name: d.name, ty, line: d.line, info: { name: d.name, ty, line: d.line, defined: false } };
      this.scopes[0].set(d.name, sym);
      this.fns.set(d.name, sym.info);
    }
    if (ty.ret.k === 'arr') this.err(d.line, '函式不能回傳陣列');
    if (ty.variadic) this.err(d.line, '練習環境暫不支援自己寫參數個數不固定（...）的函式');
    return sym;
  };
  C.paramType = function (t) { return t.k === 'arr' ? ptr(t.of) : t; };   // 參數寫成陣列，其實是指標

  C.fnDef = function (d) {
    const sym = this.fnDecl(d, true);
    const info = sym.info;
    info.defined = true;
    info.line = d.line;
    this.fn = { name: d.name, ret: d.ty.ret, nslots: 0 };
    this.scopes.push(new Map());
    const params = [], vla = [];
    d.params.types.forEach((t, i) => {
      const nm = d.params.names[i];
      if (!nm.name) this.err(nm.line, `函式 ${d.name} 的第 ${i + 1} 個參數要有名字`);
      if (t.k === 'void') this.err(nm.line, '參數不能是 void 型態');
      const rt = t.k === 'arr' ? ptr(this.resolveType(t.of, 'param', nm.line, vla, false, true)) : this.resolveType(t, 'param', nm.line, vla);
      const s = this.newVar(nm.name, rt, nm.line, { isParam: true, wasArray: t.k === 'arr', isConst: nm.isConst });
      this.declare(s);
      params.push(s);
    });
    info.params = params;
    info.vla = vla;
    info.body = this.blockItems(d.body, true);
    info.endLine = d.body.endLine;
    info.nslots = this.fn.nslots;
    this.scopes.pop();
    this.fn = null;
  };

  // ---------- 語句 ----------
  C.blockItems = function (b, sameScope) {
    if (!sameScope) this.scopes.push(new Map());
    const items = b.items.map((s) => this.stmt(s));
    if (!sameScope) this.scopes.pop();
    return { k: 'block', items, line: b.line, endLine: b.endLine };
  };

  C.condWarn = function (n, what) {
    if (n.k === 'assign' && n.op === '=' && !n.paren) {
      this.warn(n.line, `${what}的條件裡用了 =（指定），是不是想寫 ==（比較是否相等）？`);
    }
  };
  C.emptyWarn = function (body, what, line) {
    if (body.k === 'empty' && body.line === line) {
      this.warn(line, `${what} 的括號後面緊接著分號 ;，所以${what === 'if' ? ' if 的本體' : '迴圈本體'}是空的；分號要拿掉`);
    }
  };

  C.stmt = function (s) {
    switch (s.k) {
      case 'block': return this.blockItems(s, false);
      case 'empty': return s;
      case 'decl': {
        const vars = [];
        for (const d of s.decls) {
          if (d.k === 'fndecl') { this.fnDecl(d, false); continue; }
          const v = this.varDecl(d, false);
          if (!v.sym.g) vars.push(v); else vars.push({ staticRef: v, sym: v.sym, line: v.line });
        }
        return { k: 'decl', vars, line: s.line };
      }
      case 'expr': return { k: 'expr', e: this.rvAny(s.e), line: s.line };
      case 'if': {
        this.condWarn(s.c, 'if ');
        this.emptyWarn(s.t, 'if', s.line);
        return { k: 'if', c: this.cond(s.c), t: this.stmt(s.t), f: s.f ? this.stmt(s.f) : null, line: s.line };
      }
      case 'while': case 'do': {
        this.condWarn(s.c, s.k === 'while' ? 'while ' : 'do-while ');
        if (s.k === 'while') this.emptyWarn(s.body, 'while', s.line);
        const c = this.cond(s.c);
        this.loops++; this.breaks++;
        const body = this.stmt(s.body);
        this.loops--; this.breaks--;
        return { k: s.k, c, body, line: s.line, endLine: s.endLine };
      }
      case 'for': {
        this.scopes.push(new Map());
        const init = s.init ? (s.init.k === 'decl' ? this.stmt(s.init) : { k: 'expr', e: this.rvAny(s.init.e), line: s.line }) : null;
        if (s.c) this.condWarn(s.c, 'for ');
        this.emptyWarn(s.body, 'for', s.line);
        const c = s.c ? this.cond(s.c) : null;
        const step = s.step ? this.rvAny(s.step) : null;
        this.loops++; this.breaks++;
        const body = this.stmt(s.body);
        this.loops--; this.breaks--;
        this.scopes.pop();
        return { k: 'for', init, c, step, body, line: s.line };
      }
      case 'switch': return this.switchStmt(s);
      case 'case': case 'default':
        this.err(s.line, this.sw ? `${s.k} 要寫在 switch 大括號的最外層` : `${s.k} 只能寫在 switch 裡面`);
        break;
      case 'break':
        if (!this.breaks) this.err(s.line, 'break 只能用在迴圈或 switch 裡面');
        return s;
      case 'continue':
        if (!this.loops) this.err(s.line, 'continue 只能用在迴圈裡面');
        return s;
      case 'return': {
        const ret = this.fn.ret;
        if (ret.k === 'void') {
          if (s.e) this.err(s.line, `函式 ${this.fn.name} 是 void（不回傳值），return 後面不能寫值`);
          return { k: 'return', e: null, line: s.line };
        }
        if (!s.e) this.err(s.line, `函式 ${this.fn.name} 要回傳 ${typeName(ret)}，return 後面要寫值`);
        return { k: 'return', e: this.assignConv(this.rv(s.e), ret, `${this.fn.name} 的回傳值`), line: s.line };
      }
    }
    this.err(s.line, '看不懂的語句');
  };

  C.switchStmt = function (s) {
    const e = this.rv(s.e);
    if (!isInt(e.ty)) this.err(s.line, `switch 的括號裡必須是整數（或字元），但這裡是 ${typeName(e.ty)}`);
    const ty = CI.promote(e.ty);
    if (s.body.k !== 'block') this.err(s.line, 'switch 後面要接大括號 { }');
    const saved = this.sw;
    this.sw = true;
    this.breaks++;
    this.scopes.push(new Map());
    const cases = new Map();
    let def = -1;
    const items = s.body.items.map((it, idx) => {
      if (it.k === 'case') {
        const v = this.conv(this.rv(it.v), ty);
        if (!this.isConst(v) || !isInt(v.ty)) this.err(it.line, 'case 後面必須是整數常數（例如 1 或 \'a\'），不能是變數');
        const val = CI.evalConst(v);
        if (cases.has(val)) this.err(it.line, `case ${val} 重複了`);
        cases.set(val, idx);
        return { k: 'empty', line: it.line, label: true };
      }
      if (it.k === 'default') {
        if (def >= 0) this.err(it.line, 'switch 裡只能有一個 default');
        def = idx;
        return { k: 'empty', line: it.line, label: true };
      }
      return this.stmt(it);
    });
    this.scopes.pop();
    this.breaks--;
    this.sw = saved;
    return { k: 'switch', e: this.conv(e, ty), cases, def, items, line: s.line };
  };

  // ---------- 整個程式 ----------
  function check(ast, lx, warnings) {
    const cx = new Checker(lx, warnings);
    for (const u of ast.typedefUses) {
      const td = TYPEDEFS[u.name];
      if (!cx.hasHeader(td.h)) cx.err(u.line, `${u.name} 需要 #include <${td.h[0]}>`);
    }
    cx.laterFns = new Set(ast.items.filter((x) => x.k === 'fndef').map((x) => x.name));
    for (const item of ast.items) {
      if (item.k === 'fndef') { cx.fnDef(item); continue; }
      for (const d of item.decls) {
        if (d.k === 'fndecl') cx.fnDecl(d, false);
        else cx.varDecl(d, true);
      }
    }
    for (const [name, line] of cx.called) {
      const f = cx.fns.get(name);
      if (f && !f.defined) cx.err(line, `函式 ${name} 只有宣告，沒有寫出函式本體（{ … }）`);
    }
    const main = cx.fns.get('main');
    if (!main || !main.defined) cx.err(1, '找不到 main 函式：C 程式要從 int main() { … } 開始執行');
    if (main.ty.ret.k !== 'int') cx.warn(main.line, 'main 應該要回傳 int，請寫成 int main()');
    if (main.params.length > 0 && main.params.length !== 2) cx.err(main.line, 'main 的參數只能是 () 或 (int argc, char *argv[])');
    warnings.sort((a, b) => a.line - b.line);
    return { globals: cx.globals, nGlobals: cx.nGlobals, fns: cx.fns, strings: cx.strings, main };
  }

  Object.assign(CI, { Checker, check, isScalarT: isScalar, isPtrT: isPtr });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 語意分析（下半）：運算式的型態、隱式轉換、函式呼叫和格式檢查。
(function (CI) {
  'use strict';
  const { T, ptr, isInt, isFloat, isArith, isPtr, isScalar, sameType, typeName, promote, uac, makeConv, NULLP } = CI;
  const C = CI.Checker.prototype;

  const CMP = new Set(['==', '!=', '<', '>', '<=', '>=']);
  const INT_ONLY = new Set(['%', '<<', '>>', '&', '|', '^']);

  // ---------- 轉換 ----------
  C.conv = function (e, to) {
    if (sameType(e.ty, to) && !(e.ty.k === 'int' && e.ty.isBool !== to.isBool)) return e.ty === to ? e : Object.assign({}, e, { ty: to });
    if (e.k === 'num' && to.k !== 'void' && !(isPtr(to) && !isPtr(e.ty) && e.v != 0)) { // eslint-disable-line eqeqeq
      return { k: 'num', v: makeConv(e.ty, to)(e.v), ty: to, line: e.line, isNull: e.isNull || (isPtr(to) && e.v == 0) }; // eslint-disable-line eqeqeq
    }
    return { k: 'conv', e, ty: to, from: e.ty, line: e.line };
  };
  C.isNull = (e) => (e.k === 'num' && (e.isNull || (isInt(e.ty) && e.v == 0))); // eslint-disable-line eqeqeq
  C.isConst = function (e) {
    switch (e.k) {
      case 'num': return !isPtr(e.ty) || e.isNull;
      case 'conv': return !isPtr(e.ty) && this.isConst(e.e);
      case 'neg': case 'pos': case 'bnot': case 'not': return this.isConst(e.e);
      case 'arith': case 'cmp': case 'logic': return this.isConst(e.l) && this.isConst(e.r);
      case 'cond': return this.isConst(e.c) && this.isConst(e.a) && this.isConst(e.b);
    }
    return false;
  };
  const compatPtr = (a, b) => sameType(a.to, b.to) || a.to.k === 'void' || b.to.k === 'void' ||
    (a.to.k === 'int' && b.to.k === 'int' && a.to.size === b.to.size && a.to.rank === b.to.rank);

  C.assignConv = function (e, to, what) {
    const from = e.ty;
    if (from.k === 'void') this.err(e.line, `${what}：這個函式是 void，沒有回傳值可以用`);
    if (isPtr(to)) {
      if (isPtr(from)) {
        if (!compatPtr(from, to)) this.warn(e.line, `${what}：指標型態不一樣（${typeName(from)} 和 ${typeName(to)}）`);
        return this.conv(e, to);
      }
      if (this.isNull(e)) return this.conv(e, to);
      if (isInt(from)) {
        const hint = to.to.k === 'int' && to.to.size === 1 && e.k === 'num' ? '字串要用雙引號，例如 "abc"' :
          e.k === 'var' ? `要傳位址的話請寫 &${e.sym.name}` : '';
        this.err(e.line, `${what}：需要的是指標（${typeName(to)}），但給的是整數 ${typeName(from)}。${hint}`);
      }
      this.err(e.line, `${what}：需要 ${typeName(to)}，但給的是 ${typeName(from)}`);
    }
    if (isArith(to)) {
      if (isArith(from)) return this.conv(e, to);
      if (isPtr(from)) {
        if (to.isBool) return this.conv(e, to);
        const hint = to.k === 'int' && to.size === 1 && from.to.k === 'int' && from.to.size === 1 ?
          '。字元要用單引號，例如 \'a\'；雙引號 "a" 是字串' : '';
        this.err(e.line, `${what}：需要 ${typeName(to)}，但給的是指標（${typeName(from)}）${hint}`);
      }
    }
    this.err(e.line, `${what}：需要 ${typeName(to)}，但給的是 ${typeName(from)}`);
  };

  // 拿來當「值」用：陣列變成指向第一格的指標
  C.rvAny = function (n) {
    const e = this.expr(n);
    if (e.ty.k === 'arr') return { k: 'decay', e, ty: ptr(e.ty.of), line: e.line };
    return e;
  };
  C.rv = function (n) {
    const e = this.rvAny(n);
    if (e.ty.k === 'void') this.err(e.line, '這裡需要一個值，但這個函式是 void（沒有回傳值）');
    return e;
  };
  C.cond = function (n) {
    const e = this.rv(n);
    if (!isScalar(e.ty)) this.err(e.line, `條件必須是數字或指標，但這裡是 ${typeName(e.ty)}`);
    return e;
  };
  // 呼叫參數個數不固定的函式（printf）時，多出來的參數要做 default argument promotion
  C.promoteArg = function (e) {
    if (isFloat(e.ty) && e.ty.size === 4) return this.conv(e, T.double);
    if (isInt(e.ty)) return this.conv(e, promote(e.ty));
    return e;
  };
  C.scaleOf = function (t) {                // 指標 +1 要跳過幾格（VLA 的話要執行時才知道）
    const f = [];
    let n = 1;
    while (t.k === 'arr') { if (t.vla !== undefined) f.push(t.vla); else n *= t.len; t = t.of; }
    return f.length ? { n, slots: f } : n;
  };
  C.sizeOf = function (t, line) {
    if (t.k === 'fn') this.err(line, 'sizeof 不能用在函式上');
    if (t.k === 'void') this.err(line, 'sizeof(void) 沒有意義');
    if (t.k === 'arr') {
      if (t.len == null && t.vla === undefined) this.err(line, '這個陣列沒有大小，不能用 sizeof');
      const s = this.sizeOf(t.of, line);
      if (t.vla !== undefined || typeof s !== 'number') return { slots: [t.vla].concat(typeof s === 'number' ? [] : s.slots), n: typeof s === 'number' ? s : s.n };
      return t.len * s;
    }
    return t.size;
  };

  const varName = (e) => (e.k === 'var' ? e.sym.name : e.k === 'decay' && e.e.k === 'var' ? e.e.sym.name : null);
  const isStrLike = (e) => isPtr(e.ty) && e.ty.to.k === 'int' && e.ty.to.size === 1;

  // ---------- 運算式 ----------
  C.expr = function (n) {
    const line = n.line;
    switch (n.k) {
      case 'num': {
        const ty = n.ty;
        const v = ty.k === 'int' ? (ty.size === 8 ? n.v : Number(n.v)) : n.v;
        return { k: 'num', v, ty, line, isChar: n.isChar };
      }
      case 'str': {
        const si = this.strings.push(n.bytes.concat([0])) - 1;
        return { k: 'str', si, ty: CI.arr(T.char, n.bytes.length + 1), lv: true, line };
      }
      case 'id': return this.ident(n);
      case 'bin': return this.binary(n);
      case 'assign': return this.assign(n);
      case 'un': return this.unary(n);
      case 'pre': case 'post': {
        const e = this.expr(n.e);
        this.needModifiable(e, n.op);
        if (!isScalar(e.ty)) this.err(line, `${n.op} 只能用在數字或指標變數上`);
        return { k: 'incdec', pre: n.k === 'pre', op: n.op, e, ty: e.ty, scale: isPtr(e.ty) ? this.scaleOf(e.ty.to) : 1, line };
      }
      case 'cond': {
        const c = this.cond(n.c), a = this.rvAny(n.a), b = this.rvAny(n.b);
        let ty;
        if (isArith(a.ty) && isArith(b.ty)) ty = uac(a.ty, b.ty);
        else if (isPtr(a.ty) && (isPtr(b.ty) || this.isNull(b))) ty = a.ty;
        else if (isPtr(b.ty) && this.isNull(a)) ty = b.ty;
        else if (a.ty.k === 'void' && b.ty.k === 'void') ty = T.void;
        else this.err(line, `?: 兩邊的型態不一樣（${typeName(a.ty)} 和 ${typeName(b.ty)}）`);
        return { k: 'cond', c, a: this.conv(a, ty), b: this.conv(b, ty), ty, line };
      }
      case 'comma': {
        const l = this.rvAny(n.l), r = this.rvAny(n.r);
        return { k: 'comma', l, r, ty: r.ty, line };
      }
      case 'cast': {
        const to = this.resolveType(n.to, 'cast', line, []);
        const e = this.rvAny(n.e);
        if (to.k === 'void') return { k: 'conv', e, ty: T.void, from: e.ty, line };
        if (!isScalar(to)) this.err(line, `不能轉型成 ${typeName(to)}`);
        if (!isScalar(e.ty)) this.err(line, `${typeName(e.ty)} 不能轉型`);
        if ((isPtr(to) && isFloat(e.ty)) || (isFloat(to) && isPtr(e.ty))) this.err(line, '指標和小數不能互相轉型');
        return this.conv(e, to);
      }
      case 'sizeof': {
        let t;
        if (n.ty) t = this.resolveType(n.ty, 'local', line, []);
        else {
          const e = this.expr(n.e);
          t = e.ty;
          if (e.k === 'var' && e.sym.isParam && e.sym.wasArray) {
            this.warn(line, `${e.sym.name} 是函式的參數：寫成陣列，其實是指標，所以 sizeof(${e.sym.name}) 是指標的大小 8，不是整個陣列的大小`);
          }
        }
        const s = this.sizeOf(t, line);
        if (typeof s === 'number') return { k: 'num', v: BigInt(s), ty: T.size_t, line };
        return { k: 'sizeofDyn', n: s.n, slots: s.slots, ty: T.size_t, line };
      }
      case 'call': return this.call(n);
      case 'index': {
        let a = this.rv(n.a), i = this.rv(n.i);
        if (isInt(a.ty) && isPtr(i.ty)) [a, i] = [i, a];
        if (!isPtr(a.ty)) {
          const nm = varName(a);
          this.err(line, nm ? `${nm} 不是陣列（是 ${typeName(a.ty)}），不能用 [ ]` : '[ ] 只能用在陣列或指標上');
        }
        if (!isInt(i.ty)) this.err(line, `陣列的索引必須是整數，但這裡是 ${typeName(i.ty)}`);
        if (a.ty.to.k === 'void') this.err(line, 'void * 不能用 [ ] 取值，要先轉型');
        return { k: 'index', base: a, i: this.conv(i, isPtr(i.ty) ? i.ty : promote(i.ty)), ty: a.ty.to, lv: true,
          scale: this.scaleOf(a.ty.to), name: varName(a), line };
      }
    }
    this.err(line, '看不懂的運算式');
  };

  C.ident = function (n) {
    const sym = this.lookup(n.name);
    if (sym && sym.k === 'var') return { k: 'var', sym, ty: sym.ty, lv: true, line: n.line };
    if (sym && sym.k === 'fn') this.err(n.line, `${n.name} 是函式，要呼叫的話後面要加括號：${n.name}(…)（練習環境不支援函式指標）`);
    const c = CI.CONST[n.name];
    if (c) {
      if (!this.hasHeader(c.h)) this.err(n.line, `${n.name} 需要 #include <${[].concat(c.h)[0]}>`);
      return { k: 'num', v: c.v, ty: c.ty, line: n.line, isNull: n.name === 'NULL' };
    }
    if (CI.LIB[n.name]) this.err(n.line, `${n.name} 是函式，要呼叫的話後面要加括號：${n.name}(…)`);
    this.undeclared(n.name, n.line, false);
  };
  const UNSUPPORTED_FN = {
    gets: 'gets 已經從 C 語言移除了（很容易讀超過陣列），請改用 scanf("%s", s) 或 fgets(s, 大小, stdin)',
    system: '練習環境不支援 system（像 system("pause") 在這裡不需要，程式結束後會自動顯示結果）',
    getch: 'getch 是 conio.h 的函式，不是標準 C；讀一個字元請用 getchar()',
    malloc: '練習環境暫不支援 malloc（動態配置記憶體），請先用一般的陣列',
    calloc: '練習環境暫不支援 calloc（動態配置記憶體），請先用一般的陣列',
    realloc: '練習環境暫不支援 realloc（動態配置記憶體），請先用一般的陣列',
    free: '練習環境暫不支援 free（動態配置記憶體）',
    qsort: '練習環境暫不支援 qsort（需要函式指標），請自己寫排序',
    fopen: '練習環境不能開檔案，請用 scanf 從標準輸入讀資料',
    scanf_s: 'scanf_s 是 Visual Studio 才有的函式，標準 C 請用 scanf',
    printf_s: 'printf_s 是 Visual Studio 才有的函式，標準 C 請用 printf',
    sprintf: '練習環境暫不支援 sprintf', sscanf: '練習環境暫不支援 sscanf',
    itoa: 'itoa 不是標準 C 的函式，請自己用 % 10 和 / 10 拆出每一位',
    strrev: 'strrev 不是標準 C 的函式，請自己用迴圈把字串反轉',
  };
  C.undeclared = function (name, line, isCall) {
    if (isCall && UNSUPPORTED_FN[name] && !this.lookup(name)) this.err(line, UNSUPPORTED_FN[name]);
    const lib = CI.LIB[name];
    if (lib && !this.hasHeader(lib.h)) this.err(line, `${name} 需要 #include <${[].concat(lib.h)[0]}>`);
    if (isCall && this.laterFns.has(name)) {
      this.err(line, `在這裡呼叫 ${name} 的時候，它還沒有被宣告：把函式 ${name} 寫在呼叫它的函式前面，或是在前面加上它的原型（例如 int ${name}(…);）`);
    }
    const s = this.suggest(name);
    this.err(line, `${isCall ? '函式' : '變數'} ${name} 沒有宣告過` + (s ? `，是不是想寫 ${s}？` : (isCall ? '' : `。請先宣告，例如 int ${name};`)));
  };

  C.needModifiable = function (e, what) {
    if (!e.lv) this.err(e.line, `${what} 的左邊必須是變數（或陣列的一格），不能是運算的結果`);
    if (e.k === 'str') this.err(e.line, '字串常數不能修改');
    if (e.ty.k === 'arr') this.err(e.line, '陣列不能用 = 整個賦值，要用迴圈一格一格複製（字串用 strcpy）');
    if (e.k === 'var' && e.sym.isConst) this.err(e.line, `${e.sym.name} 是 const（常數），不能修改`);
  };

  C.binary = function (n) {
    const op = n.op, line = n.line;
    if (op === '&&' || op === '||') return { k: 'logic', op, l: this.cond(n.l), r: this.cond(n.r), ty: T.int, line };
    const l = this.rv(n.l), r = this.rv(n.r);
    const lt = l.ty, rt = r.ty;
    if ((op === '+' || op === '-') && isPtr(lt) && isInt(rt)) return this.padd(l, r, op, line);
    if (op === '+' && isInt(lt) && isPtr(rt)) return this.padd(r, l, op, line);
    if (op === '-' && isPtr(lt) && isPtr(rt)) {
      if (!compatPtr(lt, rt)) this.err(line, `兩個不同型態的指標不能相減（${typeName(lt)} 和 ${typeName(rt)}）`);
      return { k: 'psub', l, r, ty: T.long, scale: this.scaleOf(lt.to), line };
    }
    if (CMP.has(op)) {
      if (isPtr(lt) || isPtr(rt)) {
        if ((op === '==' || op === '!=') && isStrLike(l) && isStrLike(r)) {
          this.warn(line, `用 ${op} 比較字串，比的是位址，不是內容；要比較內容請用 strcmp(a, b) ${op} 0`);
        }
        if (isPtr(lt) && isPtr(rt)) return { k: 'pcmp', op, l, r, ty: T.int, line };
        if (isPtr(lt) && this.isNull(r)) return { k: 'pcmp', op, l, r: this.conv(r, lt), ty: T.int, line };
        if (isPtr(rt) && this.isNull(l)) return { k: 'pcmp', op, l: this.conv(l, rt), r, ty: T.int, line };
        const sp = isPtr(lt) ? l : r, other = isPtr(lt) ? r : l;
        if (isStrLike(sp) && isInt(other.ty) && sp.k === 'decay' && sp.e.k === 'str') {
          this.err(line, '字元要用單引號，例如 \'a\'；雙引號 "a" 是字串，不能和字元比較');
        }
        if (isStrLike(sp) && other.isChar) {
          this.err(line, '不能把字串和字元比較；要比較字串裡的某個字元，請寫 s[i] == \'a\'');
        }
        this.err(line, `指標（${typeName(isPtr(lt) ? lt : rt)}）不能和 ${typeName(isPtr(lt) ? rt : lt)} 比較`);
      }
      this.needArith(l, op); this.needArith(r, op);
      const ty = uac(lt, rt);
      return { k: 'cmp', op, l: this.conv(l, ty), r: this.conv(r, ty), opTy: ty, ty: T.int, line };
    }
    this.needArith(l, op); this.needArith(r, op);
    if (INT_ONLY.has(op) && !(isInt(lt) && isInt(rt))) {
      this.err(line, op === '%' ? `% 只能用在整數上，但這裡有小數（${typeName(isInt(lt) ? rt : lt)}）。小數的餘數可以用 math.h 的 fmod` :
        `${op} 只能用在整數上`);
    }
    if (op === '<<' || op === '>>') {
      const ty = promote(lt);
      return { k: 'arith', op, l: this.conv(l, ty), r: this.conv(r, promote(rt)), ty, opTy: ty, line };
    }
    const ty = uac(lt, rt);
    if ((op === '/' || op === '%') && r.k === 'num' && isInt(r.ty) && r.v == 0) this.warn(line, '除以 0：執行到這裡會出錯'); // eslint-disable-line eqeqeq
    return { k: 'arith', op, l: this.conv(l, ty), r: this.conv(r, ty), ty, opTy: ty, line };
  };
  C.needArith = function (e, op) {
    if (!isArith(e.ty)) {
      const nm = varName(e);
      this.err(e.line, `「${op}」不能用在 ${nm ? nm + '（' + typeName(e.ty) + '）' : typeName(e.ty)} 上` +
        (isPtr(e.ty) && e.ty.to.k === 'int' && e.ty.to.size === 1 ? '；字串不能直接運算，要一個字元一個字元處理' : ''));
    }
  };
  C.padd = function (p, i, op, line) {
    if (p.ty.to.k === 'void') this.err(line, 'void * 不能做加減，要先轉型');
    return { k: 'padd', op, p, i: this.conv(i, CI.is64(i.ty) ? i.ty : T.int), ty: p.ty, scale: this.scaleOf(p.ty.to), line };
  };

  C.assign = function (n) {
    const l = this.expr(n.l), line = n.line;
    if (l.ty.k === 'arr' && n.op === '=' && n.r.k === 'str') {
      this.err(line, `陣列不能用 = 指定字串，要用 strcpy(${varName(l) || '目標'}, "…")（需要 #include <string.h>）`);
    }
    this.needModifiable(l, n.op);
    const desc = varName(l) ? `指定給 ${varName(l)}` : '指定';
    if (n.op === '=') return { k: 'assign', op: '=', l, r: this.assignConv(this.rv(n.r), l.ty, desc), ty: l.ty, line };
    const bop = n.op.slice(0, -1);
    const r = this.rv(n.r);
    if (isPtr(l.ty) && (bop === '+' || bop === '-') && isInt(r.ty)) {
      return { k: 'passign', op: bop, l, r: this.conv(r, CI.is64(r.ty) ? r.ty : T.int), ty: l.ty, scale: this.scaleOf(l.ty.to), line };
    }
    this.needArith(l, n.op); this.needArith(r, n.op);
    if (INT_ONLY.has(bop) && !(isInt(l.ty) && isInt(r.ty))) this.err(line, `${n.op} 只能用在整數上`);
    const opTy = bop === '<<' || bop === '>>' ? promote(l.ty) : uac(l.ty, r.ty);
    return { k: 'assign', op: bop, l, r: this.conv(r, bop === '<<' || bop === '>>' ? promote(r.ty) : opTy), opTy, ty: l.ty, line };
  };

  C.unary = function (n) {
    const line = n.line;
    if (n.op === '&') {
      const e = this.expr(n.e);
      if (!e.lv) this.err(line, '& 只能用在變數（或陣列的一格）上，用來取得它的位址');
      return { k: 'addr', e, ty: ptr(e.ty), line };
    }
    if (n.op === '*') {
      const e = this.rv(n.e);
      if (!isPtr(e.ty)) {
        const nm = varName(e);
        this.err(line, `* 只能用在指標上，但${nm ? ' ' + nm + ' 是' : '這裡是'} ${typeName(e.ty)}`);
      }
      if (e.ty.to.k === 'void') this.err(line, '不能對 void * 取值，要先轉型成別的指標');
      return { k: 'deref', e, ty: e.ty.to, lv: true, line };
    }
    if (n.op === '!') return { k: 'not', e: this.cond(n.e), ty: T.int, line };
    const e = this.rv(n.e);
    this.needArith(e, n.op);
    if (n.op === '~' && !isInt(e.ty)) this.err(line, '~ 只能用在整數上');
    const ty = promote(e.ty);
    return { k: n.op === '-' ? 'neg' : n.op === '+' ? 'pos' : 'bnot', e: this.conv(e, ty), ty, line };
  };

  C.call = function (n) {
    const line = n.line;
    if (n.f.k !== 'id') this.err(line, '練習環境只支援直接用函式名稱呼叫，例如 f(x)');
    const name = n.f.name;
    const sym = this.lookup(name);
    if (sym && sym.k === 'var') this.err(line, `${name} 是變數，不是函式，不能加括號呼叫`);
    if (sym && sym.k === 'fn') {
      const f = sym.ty;
      if (!this.called.has(name)) this.called.set(name, line);
      if (!f.unspec && n.args.length !== f.params.length) {
        this.err(line, `函式 ${name} 需要 ${f.params.length} 個參數，但這裡給了 ${n.args.length} 個`);
      }
      const args = n.args.map((a, i) => (f.unspec ? this.promoteArg(this.rv(a)) :
        this.assignConv(this.rv(a), f.params[i], `呼叫 ${name} 的第 ${i + 1} 個參數`)));
      return { k: 'call', fn: sym.info, args, ty: f.ret, line };
    }
    const lib = CI.LIB[name];
    if (!lib || !this.hasHeader(lib.h)) this.undeclared(name, line, true);
    const np = lib.params.length;
    if (lib.variadic ? n.args.length < np : n.args.length !== np) {
      this.err(line, `${name} 需要${lib.variadic ? '至少' : ''} ${np} 個參數，但這裡給了 ${n.args.length} 個`);
    }
    const info = [];
    const args = n.args.map((a, i) => {
      const e = this.rv(a);
      if (i < np) return this.assignConv(e, lib.params[i], `${name} 的第 ${i + 1} 個參數`);
      const p = this.promoteArg(e);
      info.push({ ty: p.ty, orig: e.ty });
      return p;
    });
    const out = { k: 'call', lib, args, argTys: args.map((a) => a.ty), ty: lib.ret, line };
    if (lib.fmt === 'scanf') {
      const k = args.findIndex((a, i) => i > 0 && !isPtr(a.ty) && varName(a));
      if (k > 0) out.missingAmp = { argNo: k + 1, name: varName(args[k].k === 'conv' ? args[k].e : args[k]) };
    }
    if (lib.fmt) {
      const f = args[0];
      const s = f.k === 'decay' && f.e.k === 'str' ? this.strings[f.e.si] : null;
      if (s) {
        out.fmtItems = CI.parseFormat(String.fromCharCode(...s.slice(0, -1)), lib.fmt);
        CI.checkFormat(lib.fmt, out.fmtItems, info, (ln, msg) => this.warn(ln, msg), line);
      }
    }
    return out;
  };

  Object.assign(CI, { NULLP_CHECK: NULLP });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 執行環境的基礎：記憶體區塊、讀寫檢查（越界、沒初始化、空指標）、字串讀寫、輸出、trace 快照。
(function (CI) {
  'use strict';
  const { RErr, Limit, T, typeName, wrapper, makeConv, overwriteLow, arrDims, NULLP } = CI;

  const STACK_BASE = 0x7ffee0000010, GLOBAL_BASE = 0x555555558010, STR_BASE = 0x555555556010;

  // 一個變數（或陣列、字串常數）就是一個區塊；陣列不論幾維都攤平成一排格子（row-major）
  function Block(name, ty, et, n, dims, addr) {
    this.name = name;
    this.ty = ty;          // 宣告的型態（顯示用）
    this.et = et;          // 每一格的型態
    this.esz = et.size;
    this.n = n;            // 格子數
    this.dims = dims;      // 陣列每一維的大小；一般變數是 null
    this.addr = addr;
    this.c = new Array(n);
    this.ro = false;
    this.p0 = null;        // 指向第 0 格的指標（快取）
    this.deadIn = null;    // 所屬的函式結束後，記下函式名稱（懸空指標檢查用）
  }

  function newBlock(ctx, name, ty, dims, region) {
    const et = dims ? CI.scalarOf(ty) : ty;
    let n = 1;
    if (dims) for (const d of dims) n *= d;
    if (n > 50000000) throw new RErr(ctx.line, `陣列 ${name} 太大了（${n} 格），練習環境最多 5000 萬格`);
    const bytes = Math.max(n * et.size, 1);
    let addr;
    if (region === 'str') { addr = ctx.strp; ctx.strp += Math.ceil(bytes / 16) * 16; }
    else if (region === 'global') { addr = ctx.gp; ctx.gp += Math.ceil(bytes / 16) * 16; }
    else { addr = ctx.sp; ctx.sp += Math.ceil(bytes / 16) * 16; }
    return new Block(name, ty, et, n, dims, addr);
  }
  const p0 = (b) => b.p0 || (b.p0 = { b, o: 0 });

  // 陣列第 o 格的寫法，例如 a[5] 或 a[1][2]
  function idxStr(b, o) {
    if (!b.dims || b.dims.length === 1) return `[${o}]`;
    const parts = [];
    let rest = o;
    for (let k = b.dims.length - 1; k > 0; k--) {
      const d = b.dims[k];
      parts.unshift(((rest % d) + d) % d);
      rest = Math.floor(rest / d);
    }
    parts.unshift(rest);
    return parts.map((x) => `[${x}]`).join('');
  }
  function blockDesc(b) {
    if (b.ro) return '字串常數';
    return b.dims ? `陣列 ${b.name}` : `變數 ${b.name}`;
  }
  const declHint = (b) => {
    const tn = typeName(b.ty);
    return `${tn.endsWith('*') ? tn : tn + ' '}${b.name} = ${b.ty.k === 'ptr' ? 'NULL' : '0'};`;
  };

  function oob(b, o, line) {
    if (b.ro) throw new RErr(line, '讀取超過了字串常數的範圍（字串的結尾沒有 \'\\0\'？）');
    if (!b.dims) {
      throw new RErr(line, `指標指到變數 ${b.name} 以外的地方了：${b.name} 不是陣列，只有一格。真正的 C 不會幫你檢查，只會默默讀寫到別的記憶體。`);
    }
    const last = b.dims.length === 1 ? `[${b.n - 1}]` : b.dims.map((d) => `[${d - 1}]`).join('');
    const first = b.dims.map(() => '[0]').join('');
    const size = b.dims.length === 1 ? `只有 \`${b.name}[0]\` ~ \`${b.name}${last}\`` :
      `是 ${b.dims.join('×')} 的陣列（\`${b.name}${first}\` ~ \`${b.name}${last}\`）`;
    throw new RErr(line, `存取 \`${b.name}${idxStr(b, o)}\` 超出範圍，\`${b.name}\` ${size}。真正的 C 不會幫你檢查，只會默默讀寫到別的記憶體。`);
  }
  function uninit(b, o, line) {
    if (!b.dims) {
      throw new RErr(line, `變數 \`${b.name}\` 還沒給值就被使用了（裡面是垃圾值）。記得先寫 \`${declHint(b)}\``);
    }
    throw new RErr(line, `\`${b.name}${idxStr(b, o)}\` 還沒給值就被使用了（裡面是垃圾值）。陣列宣告之後，每一格都要先設定好（或在宣告時寫 = {0}）`);
  }
  function badPtr(p, line) {
    if (p.o === 0) throw new RErr(line, '使用了空指標（NULL）：這個指標沒有指向任何變數');
    throw new RErr(line, '使用了無效的指標：它沒有指向任何變數');
  }
  // 讀寫指標指到的那一格（ety = 透過指標看到的型態）
  function dead(b, line) {
    throw new RErr(line, `這個指標指向函式 ${b.deadIn} 裡的區域變數 ${b.name}，但 ${b.deadIn} 已經執行完了，${b.name} 已經不存在（懸空指標）。` +
      '不要回傳區域變數的位址');
  }
  function rd(p, ety, line, o) {
    const b = p.b;
    if (b === null) badPtr(p, line);
    if (b.deadIn) dead(b, line);
    if (o < 0 || o >= b.n) oob(b, o, line);
    const v = b.c[o];
    if (v === undefined) uninit(b, o, line);
    return b.et === ety ? v : adapt(b.et, ety, v, line);
  }
  function wr(p, ety, line, o, v) {
    const b = p.b;
    if (b === null) badPtr(p, line);
    if (b.deadIn) dead(b, line);
    if (o < 0 || o >= b.n) oob(b, o, line);
    if (b.ro) throw new RErr(line, '字串常數不能修改：用 char *p = "…" 指向的字串是唯讀的；要修改請宣告成陣列 char s[] = "…"');
    b.c[o] = b.et === ety ? v : adapt(ety, b.et, v, line);
  }
  function adapt(from, to, v, line) {
    if (from.k === to.k && from.size === to.size) return from.k === 'int' ? makeConv(from, to)(v) : v;
    throw new RErr(line, `練習環境不支援用 ${typeName(to)} 的指標去存取 ${typeName(from)} 的資料（指標轉型後存取）`);
  }

  // ---------- 字串與函式庫用的讀寫 ----------
  const isPtrVal = (p) => p !== null && typeof p === 'object' && 'o' in p;
  function readCStr(ctx, p, line, what) {
    if (!isPtrVal(p)) throw new RErr(line, `${what} 需要字串（char 陣列或 char *）`);
    const b = p.b;
    if (b === null) throw new RErr(line, `${what} 用了${p.o === 0 ? '空指標（NULL）' : '無效的指標'}，沒有指向任何字串`);
    if (b.esz !== 1) throw new RErr(line, `${what} 需要 char 陣列，但給的是 ${typeName(b.et)} 的資料`);
    let s = '';
    for (let o = p.o; ; o++) {
      if (o < 0 || o >= b.n) {
        throw new RErr(line, `${what}：字串沒有結尾的 '\\0'，一路讀到超出${blockDesc(b)}的範圍了`);
      }
      const v = b.c[o];
      if (v === undefined) {
        throw new RErr(line, `${what}：讀到還沒給值的 \`${b.name}${idxStr(b, o)}\`。字串的結尾要有 '\\0'，是不是忘了放？`);
      }
      if (v === 0) return s;
      s += String.fromCharCode(v & 255);
    }
  }
  function needAddr(p, line, argNo, what) {
    if (!isPtrVal(p)) {
      throw new RErr(line, `${what} 的第 ${argNo} 個參數要傳位址，是不是忘了 &？（真正的電腦上通常會直接當掉）`);
    }
    if (p.b === null) throw new RErr(line, `${what} 的第 ${argNo} 個參數是${p.o === 0 ? '空指標（NULL）' : '無效的指標'}`);
    if (p.b.ro) throw new RErr(line, '字串常數不能修改');
  }
  // 把一串 byte 寫進 char 陣列（scanf %s、strcpy、fgets…）
  function storeBytes(ctx, p, pty, bytes, addNul, line, argNo, what, base) {
    needAddr(p, line, argNo, what);
    const b = p.b;
    if (b.esz !== 1) throw new RErr(line, `${what} 要寫進 char 陣列，但這裡是 ${typeName(b.et)}`);
    const need = bytes.length + (addNul ? 1 : 0);
    if (p.o < 0 || p.o + need > b.n) {
      const left = Math.max(b.n - p.o, 0);
      const nm = b.dims ? b.name : `變數 ${b.name}`;
      if (what === 'scanf') {
        throw new RErr(line, `scanf 讀進來的字串有 ${bytes.length} 個字元，加上結尾的 '\\0' 要 ${need} 格，但 ${nm} 從這裡開始只剩 ${left} 格。陣列要開大一點`);
      }
      const used = base ? `（原本的內容已經用掉 ${p.o - base.o} 格）` : '';
      throw new RErr(line, `${what} 的目標陣列 ${nm} 太小：需要 ${need} 格${addNul ? '（含結尾的 \'\\0\'）' : ''}，但從這裡開始只剩 ${left} 格${used}`);
    }
    const w = wrapper(b.et);
    for (let i = 0; i < bytes.length; i++) b.c[p.o + i] = w(bytes.charCodeAt(i));
    if (addNul) b.c[p.o + bytes.length] = 0;
  }
  // 把一個數值寫到指標指的位置；型態不同時模擬「只覆寫前幾個 byte」的真實結果
  function storeVia(ctx, p, pty, v, vty, line, argNo) {
    needAddr(p, line, argNo, 'scanf');
    const b = p.b;
    if (p.o < 0 || p.o >= b.n) oob(b, p.o, line);
    const et = b.et;
    if (et.k === 'ptr') throw new RErr(line, 'scanf 不能直接讀進指標變數');
    if (et.k === vty.k && et.size === vty.size) b.c[p.o] = et.k === 'int' ? makeConv(vty, et)(v) : v;
    else b.c[p.o] = overwriteLow(b.c[p.o], et, v, vty);
  }

  function output(ctx, s, line) {
    ctx.out += s;
    if (ctx.out.length > ctx.maxOut) {
      throw new Limit(line, `輸出超過 ${Math.round(ctx.maxOut / 1024)} KB 了，可能是迴圈一直印東西停不下來`);
    }
  }

  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
  function decode(s) {
    if (!decoder) return s;
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return decoder.decode(u);
  }

  // ---------- trace：把目前的變數狀態拍成快照（只放可序列化的字串） ----------
  function charView(v) {
    const esc = { 0: '\\0', 9: '\\t', 10: '\\n', 13: '\\r', 39: "\\'", 92: '\\\\' };
    if (esc[v] !== undefined) return `'${esc[v]}'`;
    if (v >= 32 && v < 127) return `'${String.fromCharCode(v)}'`;
    return String(v);
  }
  function floatView(v, ty) {
    if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : v > 0 ? 'inf' : '-inf';
    if (ty.size === 4) {
      for (let p = 1; p <= 9; p++) { const s = Number(v.toPrecision(p)); if (Math.fround(s) === v) return fmtNum(s); }
    }
    return fmtNum(v);
  }
  const fmtNum = (x) => { const s = String(x); return /[.e]/.test(s) || !Number.isFinite(x) ? s : s + '.0'; };
  function ptrView(p) {
    if (p.b === null) return p.o === 0 ? 'NULL' : '（無效的位址）';
    const b = p.b;
    if (b.ro) return '→ 字串常數';
    if (b.dims) return `→ ${b.name}${idxStr(b, p.o)}`;
    return p.o === 0 ? `→ ${b.name}` : `→ ${b.name} 後面第 ${p.o} 格`;
  }
  function valView(v, ty) {
    if (v === undefined) return '?';
    if (ty.k === 'ptr') return ptrView(v);
    if (ty.k === 'float') return floatView(v, ty);
    if (ty.isBool) return v ? 'true' : 'false';
    if (ty.k === 'int' && ty.size === 1 && ty.signed !== false) return charView(v);
    if (ty.k === 'int' && ty.size === 1) return charView(v);
    return String(v);
  }
  const hex = (a) => '0x' + a.toString(16);
  function varView(e) {
    const b = e.b;
    if (!b.dims) return { name: e.name, type: typeName(b.ty), val: valView(b.c[0], b.et), addr: hex(b.addr) };
    const shown = Math.min(b.n, 64);
    const cells = [];
    for (let i = 0; i < shown; i++) cells.push(valView(b.c[i], b.et));
    const ad = arrDims(b.ty);
    const tyName = typeName(ad.base) + b.dims.map((d) => `[${d}]`).join('');
    const out = { name: e.name, type: tyName, dims: b.dims.slice(), cells, addr: hex(b.addr), esz: b.esz };
    if (b.n > shown) out.total = b.n;
    if (b.esz === 1) {
      const z = b.c.indexOf(0);
      if (z >= 0 && b.c.slice(0, z).every((x) => x !== undefined)) out.str = decode(b.c.slice(0, z).map((x) => String.fromCharCode(x & 255)).join(''));
    }
    return out;
  }
  function snapshot(ctx, line, note) {
    const frames = [];
    if (ctx.glive.length) frames.push({ name: '全域變數', vars: ctx.glive.map(varView) });
    for (const c of ctx.calls) frames.push({ name: c.name + '()', vars: c.live.map(varView) });
    if (ctx.outCacheKey !== ctx.out.length) { ctx.outCache = decode(ctx.out); ctx.outCacheKey = ctx.out.length; }
    return { line, note: note || '', frames, out: ctx.outCache };
  }
  function record(ctx, line, note) {
    if (ctx.tr.length >= ctx.maxTrace) { ctx.traceCut = true; return; }
    ctx.tr.push(snapshot(ctx, line, note));
  }

  function createCtx(opts) {
    const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(opts.input || '') : [];
    let input = '';
    for (let i = 0; i < enc.length; i++) input += String.fromCharCode(enc[i]);
    return {
      steps: 0, maxSteps: opts.maxSteps || 5000000, out: '', maxOut: opts.maxOut || 1 << 20,
      input, ip: 0, depth: 0, sp: STACK_BASE, gp: GLOBAL_BASE, strp: STR_BASE, line: 0,
      trace: !!opts.trace, maxTrace: opts.maxTrace || 800, tr: [], traceCut: false, calls: [], glive: [],
      stdin: 'stdin', ret: undefined, rnd: null, outCache: '', outCacheKey: 0,
    };
  }

  Object.assign(CI, {
    Block, newBlock, p0, idxStr, blockDesc, oob, uninit, badPtr, rd, wr, readCStr, storeBytes, storeVia, output,
    decode, record, valView, createCtx, NULLP_RT: NULLP, T_RT: T,
  });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 把運算式的 AST「編譯」成 JS 函式（closure）：每個函式收到目前的 frame（區塊陣列），回傳值。
(function (CI) {
  'use strict';
  const { RErr, T, makeConv, addrOf, is64, rd, wr, p0, NULLP, uninit } = CI;

  const div0 = (line, op) => { throw new RErr(line, op === '%' ? '除以 0：% 的右邊是 0' : '除以 0'); };

  // 二元算術：依運算子和型態挑出對應的實作（int 用 32 位元 wrap、64 位元用 BigInt）
  function arithFn(op, ty, line) {
    if (ty.k === 'float') {
      const f = ty.size === 4 ? Math.fround : null;
      const g = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b }[op];
      return f ? (a, b) => f(g(a, b)) : g;
    }
    if (ty.size === 8) {
      const cut = ty.signed ? (x) => BigInt.asIntN(64, x) : (x) => BigInt.asUintN(64, x);
      switch (op) {
        case '+': return (a, b) => cut(a + b);
        case '-': return (a, b) => cut(a - b);
        case '*': return (a, b) => cut(a * b);
        case '/': return (a, b) => { if (b === 0n) div0(line, op); return cut(a / b); };
        case '%': return (a, b) => { if (b === 0n) div0(line, op); return cut(a % b); };
        case '<<': return (a, b) => cut(a << BigInt(Number(b) & 63));
        case '>>': return (a, b) => cut(a >> BigInt(Number(b) & 63));
        case '&': return (a, b) => cut(a & b);
        case '|': return (a, b) => cut(a | b);
        case '^': return (a, b) => cut(a ^ b);
      }
    }
    if (ty.signed) {
      switch (op) {
        case '+': return (a, b) => (a + b) | 0;
        case '-': return (a, b) => (a - b) | 0;
        case '*': return Math.imul;
        case '/': return (a, b) => { if (b === 0) div0(line, op); return (a / b) | 0; };
        case '%': return (a, b) => { if (b === 0) div0(line, op); return (a % b) | 0; };
        case '<<': return (a, b) => a << (Number(b) & 31);
        case '>>': return (a, b) => a >> (Number(b) & 31);
        case '&': return (a, b) => a & b;
        case '|': return (a, b) => a | b;
        case '^': return (a, b) => a ^ b;
      }
    }
    switch (op) {
      case '+': return (a, b) => (a + b) >>> 0;
      case '-': return (a, b) => (a - b) >>> 0;
      case '*': return (a, b) => Math.imul(a, b) >>> 0;
      case '/': return (a, b) => { if (b === 0) div0(line, op); return Math.floor(a / b) >>> 0; };
      case '%': return (a, b) => { if (b === 0) div0(line, op); return a % b; };
      case '<<': return (a, b) => (a << (Number(b) & 31)) >>> 0;
      case '>>': return (a, b) => a >>> (Number(b) & 31);
      case '&': return (a, b) => (a & b) >>> 0;
      case '|': return (a, b) => (a | b) >>> 0;
      case '^': return (a, b) => (a ^ b) >>> 0;
    }
    throw new Error('unknown op ' + op);
  }
  const truthFn = (ty) => (ty.k === 'ptr' ? (v) => v.b !== null || v.o !== 0 : is64(ty) ? (v) => v !== 0n : (v) => v !== 0);
  function cmpFn(op) {
    switch (op) {
      case '==': return (a, b) => a === b;
      case '!=': return (a, b) => a !== b;
      case '<': return (a, b) => a < b;
      case '>': return (a, b) => a > b;
      case '<=': return (a, b) => a <= b;
      case '>=': return (a, b) => a >= b;
    }
  }
  function pcmp(op, a, b, line) {
    if (op === '==') return a.b === b.b && a.o === b.o;
    if (op === '!=') return !(a.b === b.b && a.o === b.o);
    const x = a.b === b.b ? a.o : addrOf(a), y = a.b === b.b ? b.o : addrOf(b);
    return cmpFn(op)(x, y);
  }

  // ---------- 編譯器 ----------
  function Compiler(ctx, prog) {
    this.ctx = ctx;
    this.prog = prog;
  }
  const P = Compiler.prototype;

  // 指標 +1 要跳過的格子數
  P.scale = function (s) {
    if (typeof s === 'number') return () => s;
    const { n, slots } = s;
    return (fr) => { let x = n; for (const k of slots) x *= fr[k]; return x; };
  };
  P.idx = function (n) {                 // 索引（整數）一律轉成 JS number
    const f = this.e(n);
    return is64(n.ty) ? (fr) => Number(f(fr)) : f;
  };
  // 變數所在的區塊（全域變數放在 ctx.G）
  P.blockOf = function (sym) {
    const s = sym.slot;
    if (sym.g) { const G = this.ctx.G; return () => G[s]; }
    return (fr) => fr[s];
  };

  // 回傳「位址」函式：fr → { b, o }
  P.addr = function (n) {
    switch (n.k) {
      case 'var': { const blk = this.blockOf(n.sym); return (fr) => p0(blk(fr)); }
      case 'str': { const ctx = this.ctx, si = n.si; return () => p0(ctx.strBlocks[si]); }
      case 'deref': return this.e(n.e);
      case 'index': {
        const base = this.e(n.base), i = this.idx(n.i), sc = this.scale(n.scale);
        if (typeof n.scale === 'number') { const k = n.scale; return (fr) => { const p = base(fr); return { b: p.b, o: p.o + i(fr) * k }; }; }
        return (fr) => { const p = base(fr); return { b: p.b, o: p.o + i(fr) * sc(fr) }; };
      }
    }
    throw new Error('not an lvalue: ' + n.k);
  };

  // 讀一個 lvalue 的值
  P.load = function (n) {
    const line = n.line, ty = n.ty;
    if (n.k === 'var') {
      const s = n.sym.slot;
      if (n.sym.g) {
        const G = this.ctx.G;
        return () => { const b = G[s], v = b.c[0]; if (v === undefined) uninit(b, 0, line); return v; };
      }
      return (fr) => { const b = fr[s], v = b.c[0]; if (v === undefined) uninit(b, 0, line); return v; };
    }
    if (n.k === 'index') {
      const base = this.e(n.base), i = this.idx(n.i);
      if (typeof n.scale === 'number' && n.scale === 1) return (fr) => { const p = base(fr); return rd(p, ty, line, p.o + i(fr)); };
      const sc = this.scale(n.scale);
      return (fr) => { const p = base(fr); return rd(p, ty, line, p.o + i(fr) * sc(fr)); };
    }
    const a = this.addr(n);
    return (fr) => { const p = a(fr); return rd(p, ty, line, p.o); };
  };
  // 寫入：回傳 (fr, v) → void；簡單變數直接寫
  P.store = function (n) {
    const line = n.line, ty = n.ty;
    if (n.k === 'var') {
      const blk = this.blockOf(n.sym);
      return (fr, v) => { blk(fr).c[0] = v; };
    }
    const a = this.addr(n);
    return (fr, v) => { const p = a(fr); wr(p, ty, line, p.o, v); };
  };

  // 條件：回傳 fr → true/false（比較運算直接回傳布林值，省掉轉成 0/1 再判斷）
  P.bool = function (n) {
    if (n.k === 'cmp') { const l = this.e(n.l), r = this.e(n.r), c = cmpFn(n.op); return (fr) => c(l(fr), r(fr)); }
    if (n.k === 'pcmp') { const l = this.e(n.l), r = this.e(n.r), op = n.op, line = n.line; return (fr) => pcmp(op, l(fr), r(fr), line); }
    if (n.k === 'logic') {
      const l = this.bool(n.l), r = this.bool(n.r);
      return n.op === '&&' ? (fr) => l(fr) && r(fr) : (fr) => l(fr) || r(fr);
    }
    if (n.k === 'not') { const e = this.bool(n.e); return (fr) => !e(fr); }
    const e = this.e(n), t = truthFn(n.ty);
    return (fr) => t(e(fr));
  };

  P.e = function (n) {
    const line = n.line, ctx = this.ctx;
    switch (n.k) {
      case 'num': { const v = n.v; return () => v; }
      case 'var': case 'index': case 'deref': return this.load(n);
      case 'decay': return this.addr(n.e);
      case 'addr': return this.addr(n.e);
      case 'conv': {
        const e = this.e(n.e), f = makeConv(n.from, n.ty);
        return (fr) => f(e(fr));
      }
      case 'arith': { const l = this.e(n.l), r = this.e(n.r), f = arithFn(n.op, n.opTy, line); return (fr) => f(l(fr), r(fr)); }
      case 'cmp': case 'pcmp': case 'logic': case 'not': { const b = this.bool(n); return (fr) => (b(fr) ? 1 : 0); }
      case 'neg': {
        const e = this.e(n.e), ty = n.ty;
        if (ty.k === 'float') return (fr) => -e(fr);
        if (is64(ty)) return ty.signed ? (fr) => BigInt.asIntN(64, -e(fr)) : (fr) => BigInt.asUintN(64, -e(fr));
        return ty.signed ? (fr) => -e(fr) | 0 : (fr) => (-e(fr)) >>> 0;
      }
      case 'pos': return this.e(n.e);
      case 'bnot': {
        const e = this.e(n.e), ty = n.ty;
        if (is64(ty)) return ty.signed ? (fr) => BigInt.asIntN(64, ~e(fr)) : (fr) => BigInt.asUintN(64, ~e(fr));
        return ty.signed ? (fr) => ~e(fr) : (fr) => (~e(fr)) >>> 0;
      }
      case 'cond': { const c = this.bool(n.c), a = this.e(n.a), b = this.e(n.b); return (fr) => (c(fr) ? a(fr) : b(fr)); }
      case 'comma': { const l = this.e(n.l), r = this.e(n.r); return (fr) => { l(fr); return r(fr); }; }
      case 'padd': {
        const p = this.e(n.p), i = this.idx(n.i), sc = this.scale(n.scale), sign = n.op === '-' ? -1 : 1;
        return (fr) => { const a = p(fr); return { b: a.b, o: a.o + sign * i(fr) * sc(fr) }; };
      }
      case 'psub': {
        const l = this.e(n.l), r = this.e(n.r), sc = this.scale(n.scale);
        return (fr) => {
          const a = l(fr), b = r(fr);
          if (a.b !== b.b) throw new RErr(line, '兩個指標指向不同的陣列，相減沒有意義');
          return BigInt(Math.trunc((a.o - b.o) / sc(fr)));
        };
      }
      case 'sizeofDyn': {
        const k = n.n, slots = n.slots;
        return (fr) => { let x = k; for (const s of slots) x *= fr[s]; return BigInt(x); };
      }
      case 'assign': return this.assign(n);
      case 'passign': {
        const a = this.addrOrVar(n.l), r = this.idx(n.r), sc = this.scale(n.scale), sign = n.op === '-' ? -1 : 1, ty = n.ty;
        return (fr) => {
          const p = a(fr), old = rd(p, ty, line, p.o);
          const v = { b: old.b, o: old.o + sign * r(fr) * sc(fr) };
          wr(p, ty, line, p.o, v);
          return v;
        };
      }
      case 'incdec': return this.incdec(n);
      case 'call': return this.call(n);
      case 'str': { const si = n.si; return () => p0(ctx.strBlocks[si]); }
    }
    throw new Error('cannot compile ' + n.k);
  };
  P.addrOrVar = function (n) { return this.addr(n); };

  P.assign = function (n) {
    const r = this.e(n.r), line = n.line;
    if (n.op === '=') {
      if (n.l.k === 'var') {
        const blk = this.blockOf(n.l.sym);
        return (fr) => { const v = r(fr); blk(fr).c[0] = v; return v; };
      }
      const a = this.addr(n.l), ty = n.l.ty;
      return (fr) => { const p = a(fr), v = r(fr); wr(p, ty, line, p.o, v); return v; };
    }
    const f = arithFn(n.op, n.opTy, line), to = makeConv(n.l.ty, n.opTy), back = makeConv(n.opTy, n.l.ty);
    if (n.l.k === 'var') {
      const get = this.load(n.l), blk = this.blockOf(n.l.sym);
      return (fr) => { const v = back(f(to(get(fr)), r(fr))); blk(fr).c[0] = v; return v; };
    }
    const a = this.addr(n.l), ty = n.l.ty;
    return (fr) => {
      const p = a(fr), v = back(f(to(rd(p, ty, line, p.o)), r(fr)));
      wr(p, ty, line, p.o, v);
      return v;
    };
  };

  P.incdec = function (n) {
    const ty = n.ty, line = n.line, pre = n.pre, d = n.op === '++' ? 1 : -1;
    let step;
    if (ty.k === 'ptr') { const sc = this.scale(n.scale); step = (v, fr) => ({ b: v.b, o: v.o + d * sc(fr) }); }
    else if (ty.k === 'float') step = ty.size === 4 ? (v) => Math.fround(v + d) : (v) => v + d;
    else if (is64(ty)) { const cut = ty.signed ? (x) => BigInt.asIntN(64, x) : (x) => BigInt.asUintN(64, x); step = (v) => cut(v + BigInt(d)); }
    else { const w = CI.wrapper(ty); step = (v) => w(v + d); }
    if (n.e.k === 'var') {
      const get = this.load(n.e), blk = this.blockOf(n.e.sym);
      return pre ? (fr) => { const v = step(get(fr), fr); blk(fr).c[0] = v; return v; }
        : (fr) => { const old = get(fr); blk(fr).c[0] = step(old, fr); return old; };
    }
    const a = this.addr(n.e);
    return (fr) => {
      const p = a(fr), old = rd(p, ty, line, p.o), v = step(old, fr);
      wr(p, ty, line, p.o, v);
      return pre ? v : old;
    };
  };

  P.call = function (n) {
    const args = n.args.map((a) => this.e(a)), k = args.length, line = n.line, ctx = this.ctx;
    if (n.lib) {
      const run = n.lib.run;
      if (n.missingAmp) {                 // scanf("%d", n)：還沒讀值之前就先指出忘了 &
        const m = n.missingAmp;
        return () => {
          throw new RErr(line, `scanf 的第 ${m.argNo} 個參數要傳位址，是不是忘了 &？應該寫成 &${m.name}（真正的電腦上通常會直接當掉）`);
        };
      }
      return (fr) => {
        const vals = new Array(k);
        for (let i = 0; i < k; i++) vals[i] = args[i](fr);
        return run(ctx, vals, n);
      };
    }
    const info = n.fn, invoke = this.invoke;
    return (fr) => {
      const vals = new Array(k);
      for (let i = 0; i < k; i++) vals[i] = args[i](fr);
      return invoke(info, vals, line);
    };
  };

  // 編譯期常數求值（陣列大小、case 標籤）
  function evalConst(n) {
    const c = new Compiler({ G: [] }, null);
    const v = c.e(n)(null);
    return typeof v === 'bigint' || typeof v === 'number' ? v : 0;
  }

  Object.assign(CI, { Compiler, evalConst, arithFn, truthFn, NULLP_E: NULLP, T_E: T });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

// 把語句編譯成 closure，並執行整個程式（全域變數初始化 → 呼叫 main）。
// 語句的 closure 回傳 0（正常）、BRK、CNT 或 RET。
(function (CI) {
  'use strict';
  const { RErr, Limit, T, typeName, newBlock, zeroOf, wrapper, record, valView, arrDims } = CI;
  const BRK = 1, CNT = 2, RET = 3;
  const MAX_DEPTH = 3000;
  const P = CI.Compiler.prototype;

  P.tick = function () {
    const ctx = this.ctx;
    return (line) => {
      if (++ctx.steps > ctx.maxSteps) {
        throw new Limit(ctx.loopLine || line, `程式執行超過 ${ctx.maxSteps.toLocaleString('en-US')} 步，可能是無窮迴圈。檢查迴圈的條件會不會永遠成立`);
      }
    };
  };

  // 宣告時算出每一維的大小（VLA 的大小存在 frame 裡）
  function dimsOf(ty, fr) {
    if (ty.k !== 'arr') return null;
    const dims = [];
    while (ty.k === 'arr') { dims.push(ty.vla !== undefined ? fr[ty.vla] : ty.len); ty = ty.of; }
    return dims;
  }
  // 依初始值的計畫，把區塊的格子填好
  P.initFiller = function (init, ty) {
    if (!init) return null;
    if (init.k === 'expr') { const e = this.e(init.e); return (b, fr) => { b.c[0] = e(fr); }; }
    const z = zeroOf(CI.scalarOf(ty));
    if (init.k === 'str') {
      const w = wrapper(CI.scalarOf(ty)), bytes = init.bytes.map(w);
      return (b) => { b.c.fill(z); for (let i = 0; i < bytes.length; i++) b.c[i] = bytes[i]; };
    }
    const items = init.items.map((it) => ({ off: it.off, f: this.e(it.e) }));
    return (b, fr) => { b.c.fill(z); for (const it of items) b.c[it.off] = it.f(fr); };
  };

  P.s = function (n, note) {
    const ctx = this.ctx, tick = this.tick(), tr = ctx.trace, line = n.line;
    const rec = (ln, note) => record(ctx, ln, note);
    switch (n.k) {
      case 'block': {
        const fs = n.items.map((x) => this.s(x)), k = fs.length;
        return (fr) => {
          const sp = ctx.sp, live = tr ? ctx.calls[ctx.calls.length - 1].live.length : 0;
          let r = 0;
          for (let i = 0; i < k; i++) { r = fs[i](fr); if (r) break; }
          ctx.sp = sp;
          if (tr) ctx.calls[ctx.calls.length - 1].live.length = live;
          return r;
        };
      }
      case 'empty': return () => 0;
      case 'decl': {
        const parts = n.vars.map((v) => {
          if (v.staticRef) { const s = v.sym.slot; return (fr) => { if (tr) this.live(v.sym.name, ctx.G[s]); }; }
          const vlas = v.ty.k === 'arr' ? (v.vla || []).map((x) => ({ slot: x.slot, e: this.e(x.e), line: x.line })) : [];
          const fill = this.initFiller(v.init, v.ty), slot = v.sym.slot, name = v.sym.name, ty = v.ty;
          return (fr) => {
            for (const x of vlas) {
              const len = Number(x.e(fr));
              if (len <= 0) throw new RErr(x.line, `陣列 ${name} 的大小是 ${len}，必須大於 0`);
              fr[x.slot] = len;
            }
            ctx.line = line;
            const b = newBlock(ctx, name, ty, dimsOf(ty, fr), 'stack');
            if (fill) fill(b, fr);
            fr[slot] = b;
            if (tr) this.live(name, b);
          };
        });
        return (fr) => {
          tick(line);
          if (tr) rec(line, note || '');
          for (const p of parts) p(fr);
          return 0;
        };
      }
      case 'expr': {
        const e = this.e(n.e);
        return tr ? (fr) => { tick(line); rec(line, ''); e(fr); return 0; } : (fr) => { tick(line); e(fr); return 0; };
      }
      case 'if': {
        const c = this.bool(n.c), t = this.s(n.t), f = n.f ? this.s(n.f) : null;
        return (fr) => {
          tick(line);
          if (tr) rec(line, '判斷條件');
          if (c(fr)) return t(fr);
          return f ? f(fr) : 0;
        };
      }
      case 'while': {
        const c = this.bool(n.c), body = this.s(n.body);
        return (fr) => {
          for (;;) {
            tick(line);
            ctx.loopLine = line;
            if (tr) rec(line, '檢查條件');
            if (!c(fr)) return 0;
            const r = body(fr);
            if (r === BRK) return 0;
            if (r === RET) return r;
          }
        };
      }
      case 'do': {
        const c = this.bool(n.c), body = this.s(n.body), end = n.endLine || line;
        return (fr) => {
          for (;;) {
            const r = body(fr);
            if (r === BRK) return 0;
            if (r === RET) return r;
            tick(end);
            ctx.loopLine = end;
            if (tr) rec(end, '檢查條件');
            if (!c(fr)) return 0;
          }
        };
      }
      case 'for': {
        const initDecl = n.init && n.init.k === 'decl' ? this.s(n.init, '初始化') : null;
        const initE = n.init && n.init.k !== 'decl' ? this.e(n.init.e) : null;
        const c = n.c ? this.bool(n.c) : null, step = n.step ? this.e(n.step) : null, body = this.s(n.body);
        return (fr) => {
          const sp = ctx.sp, live = tr ? ctx.calls[ctx.calls.length - 1].live.length : 0;
          if (initDecl) initDecl(fr);
          if (initE) { tick(line); if (tr) rec(line, '初始化'); initE(fr); }
          let r = 0;
          for (;;) {
            tick(line);
            ctx.loopLine = line;
            if (tr) rec(line, '檢查條件');
            if (c && !c(fr)) break;
            r = body(fr);
            if (r === BRK) { r = 0; break; }
            if (r === RET) break;
            r = 0;
            if (step) { tick(line); if (tr) rec(line, '更新'); step(fr); }
          }
          ctx.sp = sp;
          if (tr) ctx.calls[ctx.calls.length - 1].live.length = live;
          return r;
        };
      }
      case 'switch': {
        const e = this.e(n.e), items = n.items.map((x) => this.s(x)), cases = n.cases, def = n.def, k = items.length;
        return (fr) => {
          tick(line);
          if (tr) rec(line, '判斷要跳到哪個 case');
          let start = cases.get(e(fr));
          if (start === undefined) start = def;
          if (start < 0) return 0;
          const sp = ctx.sp;
          let r = 0;
          for (let i = start; i < k; i++) { r = items[i](fr); if (r) break; }
          ctx.sp = sp;
          return r === BRK ? 0 : r;
        };
      }
      case 'break': return (fr) => { tick(line); if (tr) rec(line, 'break：跳出'); return BRK; };
      case 'continue': return (fr) => { tick(line); if (tr) rec(line, 'continue：跳到下一圈'); return CNT; };
      case 'return': {
        const e = n.e ? this.e(n.e) : null, rty = n.e ? n.e.ty : null;
        return (fr) => {
          tick(line);
          ctx.ret = e ? e(fr) : undefined;
          if (tr) rec(line, e ? `回傳 ${valView(ctx.ret, rty)}` : '回傳');
          return RET;
        };
      }
    }
    throw new Error('cannot compile statement ' + n.k);
  };

  P.live = function (name, b) {
    const calls = this.ctx.calls;
    if (calls.length) calls[calls.length - 1].live.push({ name, b });
  };

  // 呼叫使用者寫的函式
  function makeInvoke(ctx, comp) {
    return function invoke(info, args, callLine) {
      if (ctx.depth >= MAX_DEPTH) {
        throw new RErr(callLine, `函式呼叫太多層（超過 ${MAX_DEPTH} 層，stack overflow）。遞迴是不是忘了寫終止條件？`);
      }
      ctx.depth++;
      const fr = new Array(info.nslots), sp = ctx.sp, params = info.params;
      for (let i = 0; i < params.length; i++) {
        const p = params[i], b = newBlock(ctx, p.name, p.ty, null, 'stack');
        b.c[0] = args[i];
        fr[p.slot] = b;
      }
      for (const v of info.vlaRt) {
        const len = Number(v.e(fr));
        if (len <= 0) throw new RErr(v.line, `陣列參數的大小是 ${len}，必須大於 0`);
        fr[v.slot] = len;
      }
      if (ctx.trace) {
        ctx.calls.push({ name: info.name, live: params.map((p) => ({ name: p.name, b: fr[p.slot] })) });
        const shown = params.map((p, i) => valView(args[i], p.ty)).join(', ');
        record(ctx, info.line, `呼叫 ${info.name}(${shown})`);
      }
      const r = info.run(fr);
      for (let i = 0; i < fr.length; i++) { const b = fr[i]; if (b && b.c) b.deadIn = info.name; }
      ctx.sp = sp;
      ctx.depth--;
      if (ctx.trace) ctx.calls.pop();
      if (r === RET) { const v = ctx.ret; ctx.ret = undefined; return v; }
      if (info.ty.ret.k === 'void') return undefined;
      if (info.name === 'main') return 0;
      throw new RErr(info.endLine, `函式 ${info.name} 要回傳 ${typeName(info.ty.ret)}，但執行到最後的 } 都沒有遇到 return`);
    };
  }

  function execute(prog, ctx) {
    ctx.G = new Array(prog.nGlobals);
    const comp = new CI.Compiler(ctx, prog);
    comp.invoke = makeInvoke(ctx, comp);
    // 字串常數：唯讀的 char 陣列
    ctx.strBlocks = prog.strings.map((bytes) => {
      const b = newBlock(ctx, '字串常數', CI.arr(T.char, bytes.length), [bytes.length], 'str');
      const w = wrapper(T.char);
      for (let i = 0; i < bytes.length; i++) b.c[i] = w(bytes[i]);
      b.ro = true;
      return b;
    });
    for (const info of prog.fns.values()) {
      if (!info.defined) continue;
      info.vlaRt = (info.vla || []).map((v) => ({ slot: v.slot, e: comp.e(v.e), line: v.line }));
      info.run = comp.s(info.body);
    }
    // 全域變數和 static 變數：沒給初始值的都是 0
    for (const g of prog.globals) {
      const b = newBlock(ctx, g.sym.name, g.ty, dimsOf(g.ty, null), 'global');
      b.c.fill(zeroOf(CI.scalarOf(g.ty)));
      const fill = comp.initFiller(g.init, g.ty);
      if (fill) fill(b, null);
      ctx.G[g.sym.slot] = b;
      if (ctx.trace && !g.sym.isStaticLocal) ctx.glive.push({ name: g.sym.name, b });
    }
    const main = prog.main;
    let args = [];
    if (main.params.length === 2) {
      const name = newBlock(ctx, '字串常數', CI.arr(T.char, 6), [6], 'str');
      [97, 46, 111, 117, 116, 0].forEach((c, i) => { name.c[i] = c; });
      const argv = newBlock(ctx, 'argv', CI.arr(CI.ptr(T.char), 2), [2], 'global');
      argv.c[0] = { b: name, o: 0 };
      argv.c[1] = CI.NULLP;
      args = [1, { b: argv, o: 0 }];
    }
    const code = comp.invoke(main, args, main.line);
    if (ctx.trace) record(ctx, main.endLine, '程式結束');
    return code;
  }

  Object.assign(CI, { execute, arrDimsRt: arrDims });
})(globalThis.CInterpParts || (globalThis.CInterpParts = {}));

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
