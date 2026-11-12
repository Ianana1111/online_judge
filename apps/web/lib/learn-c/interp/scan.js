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
