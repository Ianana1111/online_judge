/** Bounded, opt-in production drill. Creates only disposable fixture accounts, uses the real
 * API/queues/Vercel judge, and removes its own rows/jobs afterwards. Never prints credentials. */
import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
const requireApi = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = requireApi('@prisma/client'), Redis = requireApi('ioredis'), jwt = requireApi('jsonwebtoken'), { Queue } = requireApi('bullmq');
assert.equal(process.env.CAPACITY_DRILL_PRODUCTION, '1', 'Explicit production opt-in required');
const count = Number(process.env.CAPACITY_DRILL_USERS ?? 5);
assert.ok(Number.isInteger(count) && count >= 1 && count <= 50, 'Between 1 and 50 fixture users');
const variables = (service) => JSON.parse(execFileSync('railway', ['variable', 'list', '--service', service, '--environment', 'production', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
const api = variables('api'), pg = variables('Postgres'), rv = variables('Redis');
const prisma = new PrismaClient({ datasourceUrl: pg.DATABASE_PUBLIC_URL });
const redis = new Redis(rv.REDIS_PUBLIC_URL, { maxRetriesPerRequest: 1, commandTimeout: 5000 });
redis.on('error', () => {});
const queueNames = ['judge-submissions-local', 'judge-test-runs'];
const queues = queueNames.map((name) => new Queue(name, { connection: { url: rv.REDIS_PUBLIC_URL, maxRetriesPerRequest: 1 } }));
const base = 'https://api.judge.tw', prefix = `cap_${randomBytes(4).toString('hex')}_`, began = new Date();
const users = [], jobs = [], streams = [], controllers = [], latencies = [], peaks = { submit: 0, run: 0, sandbox: 0, workerRssMb: 0, redisMb: 0 };
let cleanupComplete = false;
let resultReport;
async function request(user, path, method = 'GET', body) {
  const start = performance.now();
  const response = await fetch(base + path, { method, headers: { Cookie: user.cookie, 'x-csrf-token': user.csrf, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  latencies.push(performance.now() - start);
  const data = await response.json();
  assert.ok(response.ok, `${method} ${path.split('/')[1]} returned ${response.status} (${data.code ?? 'request failure'})`);
  return data;
}
async function watch(user, path, terminal) {
  const controller = new AbortController(); controllers.push(controller);
  const timeout = setTimeout(() => controller.abort(), 180000);
  try {
    const response = await fetch(base + path + '/stream', { headers: { Cookie: user.cookie }, signal: controller.signal });
    if (!response.ok) return false;
    const reader = response.body.getReader(), decoder = new TextDecoder(); let pending = '';
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) return false;
        pending += decoder.decode(value, { stream: true });
        const messages = pending.split('\n\n'); pending = messages.pop();
        for (const message of messages) {
          const line = message.split('\n').find((s) => s.startsWith('data: '));
          if (line && terminal(JSON.parse(line.slice(6)))) return true;
        }
      }
    } finally { await reader.cancel().catch(() => {}); }
  } catch { return false; }
  finally { clearTimeout(timeout); }
}
try {
  await redis.ping();
  const initial = await Promise.all(queues.map((q) => q.getJobCounts('wait', 'active', 'delayed')));
  assert.ok(initial.every((q) => q.wait + q.active + q.delayed === 0), 'Wait for existing real judge traffic to finish before this drill');
  const problem = await prisma.problem.findFirstOrThrow({ where: { uvaId: 10055, visibility: true }, include: { samples: { orderBy: { ord: 'asc' } } } });
  const languageFiles = [['cpp17', 'cpp17.cpp'], ['c11', 'c11.c'], ['python3', 'python3.py'], ['java17', 'java17.java']];
  const sources = await Promise.all(languageFiles.map(async ([languageKey, file]) => ({ languageKey, sourceCode: await readFile(new URL(`../content/editorials/uva-10055-hashmat/${file}`, import.meta.url), 'utf8') })));
  for (let n = 0; n < count; n++) {
    const handle = prefix + n, sid = randomUUID(), raw = randomBytes(24).toString('hex'), csrf = `${raw}.${createHmac('sha256', api.CSRF_SECRET).update(raw).digest('hex')}`;
    const user = await prisma.user.create({ data: { handle, email: `${handle}@example.test`, plan: 'PRO', planExpiresAt: new Date(Date.now() + 3600000) } });
    const token = jwt.sign({ sub: user.id, handle, sid, role: 'USER', purpose: 'access', ver: user.authVersion }, api.JWT_ACCESS_SECRET, { algorithm: 'HS256', issuer: 'judge.tw', audience: 'judge.tw:access', expiresIn: '15m' });
    users.push({ id: user.id, csrf, sid, cookie: `access_token=${token}; csrf_token=${csrf}` });
    await redis.set(`refresh:${user.id}:${sid}`, 'capacity-fixture', 'EX', 900);
  }
  await writeFile(`/private/tmp/${prefix}fixtures.json`, JSON.stringify({ prefix, createdAt: began, userIds: users.map((u) => u.id) }), { mode: 0o600 });
  console.log(JSON.stringify({ phase: 'submitting', users: count, requests: count * 2 }));
  const started = Date.now();
  const posted = await Promise.allSettled(users.flatMap((user, n) => [
    (async () => {
      const { id } = await request(user, '/submissions', 'POST', { problemId: problem.id, ...sources[n % sources.length], clientRequestId: randomUUID() });
      jobs.push({ kind: 'submit', id, user });
      streams.push(watch(user, `/submissions/${id}`, (data) => !['PENDING', 'JUDGING'].includes(data.verdict)));
    })(),
    (async () => {
      const { id } = await request(user, '/runs', 'POST', { problemId: problem.id, ...sources[n % sources.length], cases: problem.samples.slice(0, 8).map((s) => ({ id: `sample-${s.ord}`, sampleOrd: s.ord })) });
      jobs.push({ kind: 'run', id, user });
      streams.push(watch(user, `/runs/${id}`, (data) => data.status !== 'RUNNING'));
    })(),
  ]));
  assert.ok(posted.every((r) => r.status === "fulfilled"), "All fixture requests must be accepted");
  let finished = 0, lastProgress = 0;
  const verdicts = { AC: 0, runAC: 0, errors: 0 };
  while (Date.now() - started < 180000) {
    const counts = await Promise.all(queues.map((q) => q.getJobCounts('active')));
    peaks.submit = Math.max(peaks.submit, counts[0].active); peaks.run = Math.max(peaks.run, counts[1].active);
    peaks.sandbox = Math.max(peaks.sandbox, await redis.zcount('oj:sandboxes', Date.now(), '+inf'));
    const heartbeat = JSON.parse(await redis.get('oj:judge:heartbeat') ?? '{}'); peaks.workerRssMb = Math.max(peaks.workerRssMb, heartbeat.rssMb ?? 0);
    const memory = await redis.info('memory'); peaks.redisMb = Math.max(peaks.redisMb, Math.round(Number(memory.match(/used_memory:(\d+)/)?.[1] ?? 0) / 1048576));
    const rows = await prisma.submission.findMany({ where: { userId: { in: users.map((u) => u.id) } }, select: { id: true, verdict: true } });
    const runJobs = jobs.filter((j) => j.kind === 'run');
    const runs = await redis.mget(...runJobs.map((j) => `testrun:${j.id}:result`));
    finished = rows.filter((r) => !['PENDING', 'JUDGING'].includes(r.verdict)).length + runs.filter((r) => r && JSON.parse(r).status !== 'RUNNING').length;
    verdicts.AC = rows.filter((r) => r.verdict === 'AC').length;
    verdicts.runAC = runs.filter((r) => { const v = r && JSON.parse(r); return v?.status === 'DONE' && v.cases?.length > 0 && v.cases.every((c) => c.verdict === 'AC'); }).length;
    verdicts.errors = finished - verdicts.AC - verdicts.runAC;
    if (Date.now() - lastProgress > 10000) { console.log(JSON.stringify({ phase: 'judging', finished, total: jobs.length, peaks })); lastProgress = Date.now(); }
    if (finished === jobs.length) break;
    assert.equal((await fetch(base + '/health', { signal: AbortSignal.timeout(5000) })).status, 200, 'API must stay healthy');
    await delay(1000);
  }
  const streamResults = await Promise.all(streams);
  const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * p) - 1)] ?? 0;
  resultReport = { testedAt: new Date().toISOString(), environment: 'Production Railway API/worker + Redis + PostgreSQL + real Vercel Sandbox', users: count, requests: jobs.length, elapsedSeconds: Math.round((Date.now() - started) / 1000), verdicts, streamsCompleted: streamResults.filter(Boolean).length, peaks, apiP95Ms: Math.round(percentile(latencies, .95)), scope: 'Bounded burst using four verified Hashmat solutions; not a sustained test or proof of arbitrary workload capacity.' };
  console.log(JSON.stringify(resultReport));
  assert.equal(verdicts.AC, count); assert.equal(verdicts.runAC, count); assert.equal(verdicts.errors, 0); assert.equal(streamResults.filter(Boolean).length, jobs.length);
  assert.ok(peaks.submit <= 50 && peaks.run <= 50 && peaks.sandbox <= 100);
} finally {
  controllers.forEach((c) => c.abort());
  // Discover accepted requests even if a client lost the POST response.
  const accepted = await prisma.submission.findMany({ where: { userId: { in: users.map((u) => u.id) } }, select: { id: true, userId: true } });
  for (const row of accepted) if (!jobs.some((j) => j.id === row.id)) jobs.push({ kind: "submit", id: row.id, user: users.find((u) => u.id === row.userId) });
  for (const user of users) for (const id of await redis.zrange(`oj:work:user:${user.id}`, 0, -1)) {
    if (!jobs.some((j) => j.id === id) && await redis.get(`testrun:${id}:owner`) === user.id) jobs.push({ kind: "run", id, user });
  }
  // Do not remove a user's row while a fixture's job is still executing.
  let active = true;
  for (let attempt = 0; attempt < 100 && active; attempt++) {
    active = false;
    for (const entry of jobs) {
      const queue = queues[entry.kind === 'submit' ? 0 : 1];
      const job = await queue.getJob(entry.kind === 'submit' ? `${entry.id}-1` : entry.id);
      if (job && await job.getState() === 'active') active = true;
      else if (job) await job.remove().catch(() => {});
    }
    if (active) await delay(1000);
  }
  if (!active) {
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) }, handle: { startsWith: prefix }, email: { endsWith: '@example.test' }, role: 'USER', createdAt: { gte: began } } });
    for (const u of users) await redis.del(`refresh:${u.id}:${u.sid}`, `run_cooldown:${u.id}`, `submit_cooldown:${u.id}`, `oj:work:user:${u.id}`);
    for (const j of jobs) {
      await redis.zrem(`oj:work:${j.kind}`, j.id);
      if (j.kind === 'run') { await redis.del(`testrun:${j.id}:result`, `testrun:${j.id}:owner`, `testrun:${j.id}:quota`); await redis.zrem('oj:run:results', j.id); }
    }
    cleanupComplete = true;
  }
  if (resultReport) await writeFile(new URL(`../docs/launch-readiness/capacity-production-${count}.json`, import.meta.url), JSON.stringify({ ...resultReport, cleanupComplete }, null, 2) + '\n');
  await Promise.all(queues.map((q) => q.close())); await redis.quit(); await prisma.$disconnect();
  console.log(JSON.stringify({ cleanupComplete }));
}
