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
