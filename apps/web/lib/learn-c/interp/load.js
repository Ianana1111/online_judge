// 在頁面上（不是 Worker 裡）載入解譯器：照 files.json 的順序 import，載入後 globalThis.CInterp 就能用。
import "./types.js";
import "./lexer.js";
import "./parser.js";
import "./parser-expr.js";
import "./format.js";
import "./scan.js";
import "./stdlib.js";
import "./checker.js";
import "./checker-expr.js";
import "./runtime-core.js";
import "./runtime-expr.js";
import "./runtime-stmt.js";
import "./index.js";
