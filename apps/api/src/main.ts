// Must be the very first import — Sentry's own docs require its instrumentation to load before
// anything else so it can hook into modules (http, etc.) as they're first required.
import "./instrument";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { assertRuntimeConfig } from "./common/runtime-config";
import { ecpayConfig } from "./billing/ecpay.util";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { JsonLoggerService } from "./common/json-logger.service";
import { requestIdMiddleware } from "./common/request-id.middleware";

async function bootstrap() {
  assertRuntimeConfig();
  ecpayConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: new JsonLoggerService(),
  });
  // First, before anything else touches the request — every subsequent middleware/guard/handler
  // (and every log line any of them emit) needs the request id already in AsyncLocalStorage.
  app.use(requestIdMiddleware);
  // Default Express/Nest body limit is 100kb — too small for a base64 avatar upload (see
  // users.service updateProfile). ECPay's webhooks (urlencoded) stay far under this too, so
  // raising it is strictly safer for them, never a regression.
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));
  app.useGlobalFilters(new AllExceptionsFilter());

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
  await app.listen(port, process.env.API_HOST ?? "0.0.0.0");
  console.log(`[api] listening on port ${port}`);
}

bootstrap();
