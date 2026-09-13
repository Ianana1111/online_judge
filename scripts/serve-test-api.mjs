// Playwright's managed API process. Never loads the project's .env or production credentials.
const db = new URL(process.env.DATABASE_URL ?? "invalid:");
if (db.hostname !== "127.0.0.1" || db.port !== "55432" || db.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable test database and Redis required");
Object.assign(process.env, { NODE_ENV: "test", API_HOST: "127.0.0.1", API_PORT: "55440", ECPAY_ENV: "sandbox", WEB_ORIGIN: "http://127.0.0.1:55430", SENTRY_DSN: "", RESEND_API_KEY: "", GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" });
await import("../apps/api/dist/main.js");
