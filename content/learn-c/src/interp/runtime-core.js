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
