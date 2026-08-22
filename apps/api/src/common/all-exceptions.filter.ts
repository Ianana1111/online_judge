import { Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import * as Sentry from "@sentry/node";
import { Prisma } from "@oj/db";
import { currentRequestId } from "./request-context";

// Prisma's own error codes: https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_STATUS_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: "This value is already in use." },
  P2003: { status: HttpStatus.CONFLICT, message: "This action conflicts with related data." },
  P2025: { status: HttpStatus.NOT_FOUND, message: "The requested resource was not found." },
};

/**
 * Before this filter existed, any uncaught Prisma error (a unique-constraint race, a foreign-key
 * violation, a record-not-found from a nested write) fell through to Nest's default handler as a
 * bare 500 with no useful client-facing message, and the *actual* error only ever showed up as an
 * unstructured stack trace in Railway's console — no request id, nothing to grep for. This
 * catches everything at the edge instead: known Prisma error codes map to the right HTTP status
 * with a safe, generic message (never the raw Prisma message, which can include table/column
 * names); anything already an HttpException (the overwhelming majority of thrown errors in this
 * codebase — BadRequestException, NotFoundException, etc.) passes through completely unchanged;
 * anything else is logged in full server-side and reported to the client as a bare 500 with no
 * internal detail. Every branch logs via the standard Logger, which JsonLoggerService turns into
 * a structured line carrying the current request id — so a client-reported failure can be found
 * by that id in the logs even when the request also touched the judge queue or another service.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("AllExceptionsFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const requestId = currentRequestId();

    // An SSE stream (submissions/runs) writes its own headers/body directly via @Res() — if an
    // exception happens after that's already started, the response can't be reshaped into a JSON
    // error body anymore. Just log and stop; attempting res.status()/.json() here would throw its
    // own "headers already sent" error on top of the original one.
    if (res.headersSent) {
      this.logger.error(`Unhandled exception after response started: ${String(exception)}`);
      return;
    }

    if (exception instanceof HttpException) {
      // Already the shape every controller/service in this codebase expects to throw — nothing to
      // translate, just let it through. Not logged here: a 4xx from a validation/auth/business-
      // rule check is expected traffic, not an operational problem to page anyone about.
      res.status(exception.getStatus()).json({ ...(exception.getResponse() as object), requestId });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_STATUS_MAP[exception.code];
      if (mapped) {
        this.logger.warn(`Prisma ${exception.code} on ${exception.meta?.target ?? "unknown target"}: ${exception.message}`);
        res.status(mapped.status).json({ message: mapped.message, requestId });
        return;
      }
    }

    // Anything else is a genuine bug or an infrastructure failure (DB connection drop, etc.) — log
    // the full error server-side (stack trace and all) but never leak it to the client. Sentry
    // capture is a safe no-op when SENTRY_DSN is unset (see instrument.ts) — this line doesn't
    // need to change whenever that eventually gets configured.
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(`Unhandled exception: ${String(exception)}`, stack);
    Sentry.captureException(exception, { tags: { requestId } });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again.", requestId });
  }
}
