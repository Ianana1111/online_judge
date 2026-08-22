import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

// Undefined outside of a request (e.g. a boot-time log line, or the BullMQ workers in apps/judge
// which never go through the HTTP middleware below) — callers must treat a missing id as normal,
// not an error.
export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
