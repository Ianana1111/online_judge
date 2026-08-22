import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { runWithRequestContext } from "./request-context";

/**
 * Every request gets a request id — reused from an incoming `X-Request-Id` header if the caller
 * (e.g. Railway's edge, or a future frontend that wants to correlate its own error report with a
 * specific backend log line) already set one, otherwise freshly generated. Echoed back in the
 * response header and stashed in AsyncLocalStorage so JsonLoggerService can tag every log line
 * emitted while handling this request without threading the id through every function call —
 * this is what makes "find every log line for the submission that just failed" possible at all,
 * which was previously impossible: Railway's raw text logs had no way to correlate a request's
 * own log lines together, let alone to a specific submission going through the judge queue.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers["x-request-id"];
  const requestId = typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader("X-Request-Id", requestId);
  runWithRequestContext({ requestId }, next);
}
