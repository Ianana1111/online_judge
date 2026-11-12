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
