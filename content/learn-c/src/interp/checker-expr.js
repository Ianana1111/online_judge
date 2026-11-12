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
