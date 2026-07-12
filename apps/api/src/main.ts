import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

// Every one of these has a hardcoded "dev_..._change_me" fallback where it's actually read
// (token.service.ts, csrf.util.ts, internal-token.guard.ts) so local dev works with zero setup.
// That fallback is a real risk if it's ever silently hit in production instead — a publicly
// known, hardcoded secret would let anyone forge access/refresh tokens, CSRF tokens, or the
// judge-worker's internal callback auth. Fail loudly at startup instead of failing open.
const REQUIRED_PROD_SECRETS = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "CSRF_SECRET", "INTERNAL_SERVICE_TOKEN"];

function assertProdSecretsConfigured(): void {
  if (process.env.NODE_ENV !== "production") return;
  const missing = REQUIRED_PROD_SECRETS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Refusing to start in production without required secret(s): ${missing.join(", ")}. ` +
        "These fall back to publicly-known dev defaults if unset — that is not safe outside local development.",
    );
  }
}

async function bootstrap() {
  assertProdSecretsConfigured();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      // This API only ever serves JSON/SSE/webhook responses, never HTML — a CSP header here
      // protects nothing and just adds noise.
      contentSecurityPolicy: false,
      // Helmet's default (same-origin) would make browsers refuse to read this API's responses
      // from the web app: judge.tw and api.judge.tw are different origins (different host), so
      // every fetch from the frontend is cross-origin by this policy's definition even though
      // CORS already explicitly allows it — that's the whole point of splitting them across a
      // subdomain. Explicitly allow cross-origin reads instead of silently breaking every request.
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cookieParser());
  // WEB_ORIGIN may list several allowed origins (comma-separated) — e.g. the custom domain plus the
  // *.vercel.app fallback — since credentialed CORS must echo back the exact requesting origin, not
  // a wildcard. Anything not on the list is simply not given CORS headers (browser blocks it).
  const allowedOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on port ${port}`);
}

bootstrap();
