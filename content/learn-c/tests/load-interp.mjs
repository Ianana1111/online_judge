// 在 Node 裡載入解譯器：照 files.json 的順序把每個檔案當成一般 script 執行，回傳 globalThis.CInterp。
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// 解譯器在網站裡（apps/web/lib/learn-c/interp），網站和這裡的測試共用同一份
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'apps', 'web', 'lib', 'learn-c', 'interp');

export function loadInterp() {
  const files = JSON.parse(readFileSync(join(dir, 'files.json'), 'utf8'));
  for (const f of files) vm.runInThisContext(readFileSync(join(dir, f), 'utf8'), { filename: join(dir, f) });
  return globalThis.CInterp;
}
