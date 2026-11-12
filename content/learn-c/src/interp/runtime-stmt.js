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
