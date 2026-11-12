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
          // eslint-disable-next-line no-control-regex -- 判斷字元常數裡有沒有非 ASCII（中文）字元
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
