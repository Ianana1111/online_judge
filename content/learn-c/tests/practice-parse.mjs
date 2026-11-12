// 解析一題練習（practice/<id>.md）。build.mjs 和 run-all.mjs 共用。
// 格式見 HANDOFF_SPEC.md §4.6：# 題名、id:、level:、說明、## starter / solution / hint / tests。
export function parsePractice(text, file) {
  const fail = (msg) => { throw new Error(`${file}：${msg}`); };
  const src = text.replace(/\r\n?/g, '\n');
  const lines = src.split('\n');
  const t = /^# (.+)$/.exec(lines[0] || '');
  if (!t) fail('第一行要是「# 題名」');
  const meta = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const m = /^(\w+):\s*(.*?)\s*(←.*)?$/.exec(lines[i]);
    if (!m) { if (lines[i].trim() === '') continue; break; }
    meta[m[1]] = m[2];
  }
  const rest = lines.slice(i).join('\n');
  const parts = rest.split(/^## +(\w+)\s*$/m);
  const desc = parts[0].trim();
  const sec = {};
  for (let k = 1; k < parts.length; k += 2) sec[parts[k]] = parts[k + 1] || '';
  const code = (s, name) => {
    const m = /```c\n([\s\S]*?)\n```/.exec(s || '');
    if (!m) fail(`## ${name} 裡要有一段 \`\`\`c 程式碼`);
    return m[1] + '\n';
  };
  const tests = [];
  const re = /```test\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(sec.tests || ''))) {
    const body = m[1];
    const k = body.startsWith('---\n') ? 0 : body.indexOf('\n---\n') + 1;
    if (k < 0 || (k === 0 && !body.startsWith('---\n'))) fail(`測資要用一行 --- 分開輸入和輸出`);
    const input = body.slice(0, k === 0 ? 0 : k - 1);
    const output = body.slice(k + 4);
    tests.push({ input: input ? input + '\n' : '', output: output.replace(/\n?$/, '\n') });
  }
  if (!meta.id) fail('缺少 id:');
  if (!/^[a-z0-9-]+$/.test(meta.id)) fail('id 只能有小寫英文、數字和 -');
  if (tests.length < 2) fail('至少要有 2 組測資');
  return {
    id: meta.id, title: t[1].trim(), level: +(meta.level || 1), desc,
    starter: code(sec.starter, 'starter'), solution: code(sec.solution, 'solution'),
    hint: (sec.hint || '').trim(), tests, broken: meta.broken === 'yes',
  };
}
