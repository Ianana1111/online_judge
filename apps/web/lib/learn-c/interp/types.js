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
      if (from.k === 'int') return (v) => (v == 0 ? NULLP : { b: null, o: Number(v) });  
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
