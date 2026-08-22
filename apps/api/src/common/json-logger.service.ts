import type { LoggerService, LogLevel } from "@nestjs/common";
import { currentRequestId } from "./request-context";

/**
 * Replaces Nest's default pretty-printed console logger with single-line JSON — Railway's log
 * viewer (and any future log-shipping to a real search/alerting backend) can filter/query
 * structured fields directly instead of grepping formatted text. Every line carries the current
 * request id when one exists (see request-id.middleware.ts), which is what actually makes "find
 * every log line for one request" possible — previously nothing tied a request's own scattered
 * log lines together at all.
 */
export class JsonLoggerService implements LoggerService {
  private write(level: LogLevel, message: unknown, context?: string, extra?: Record<string, unknown>): void {
    const line = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof message === "string" ? message : String(message),
      requestId: currentRequestId(),
      ...extra,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(line));
  }

  log(message: unknown, context?: string): void {
    this.write("log", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace ? { trace } : undefined);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }
}
