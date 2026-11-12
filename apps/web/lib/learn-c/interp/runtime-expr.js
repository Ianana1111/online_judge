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
  function pcmp(op, a, b, _line) {
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
