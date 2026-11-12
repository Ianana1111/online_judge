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
