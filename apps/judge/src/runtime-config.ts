export function judgeRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV === "production") {
    const token = env.INTERNAL_SERVICE_TOKEN;
    if (!token || Buffer.byteLength(token) < 32 || /dev_|change.?me|example|placeholder/i.test(token) || new Set(token).size < 10) throw new Error("Judge requires a strong INTERNAL_SERVICE_TOKEN in production");
    const origin = new URL(env.API_INTERNAL_URL ?? "invalid:");
    if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash) throw new Error("Judge requires a valid API_INTERNAL_URL");
    if (!env.DATABASE_URL || !env.REDIS_URL) throw new Error("Judge database and Redis must be configured explicitly");
  }
  const concurrency = (name: string, fallback: string) => {
    const raw = env[name] ?? fallback;
    if (!/^[1-9]\d*$/.test(raw) || Number(raw) > 64) throw new Error(`${name} must be an integer between 1 and 64`);
    return Number(raw);
  };
  if (env.JUDGE_CONCURRENCY && env.JUDGE_CONCURRENCY !== "1") throw new Error("The shared UVa account requires JUDGE_CONCURRENCY=1");
  return { localConcurrency: concurrency("JUDGE_LOCAL_CONCURRENCY", "6"), testRunConcurrency: concurrency("TEST_RUN_CONCURRENCY", "3") };
}
