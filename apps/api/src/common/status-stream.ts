import type { Request, Response } from "express";
import { HttpException } from "@nestjs/common";
import { subscribeStatus } from "./status-broker";

let streamCount = 0;
const perAccount = new Map<string, number>();

/** Subscribe before rereading durable state. Pub/sub is a wakeup, never the source of truth. */
export async function serveStatusStream<T>(req: Request, res: Response, channel: string,
  read: () => Promise<T>, terminal: (value: T) => boolean) {
  const initial = await read(); // Authenticate and return normal HTTP errors before streaming.
  const account = (req as Request & { user?: { id?: string } }).user?.id ?? req.socket.remoteAddress ?? "anonymous";
  if (streamCount >= 1500 || (perAccount.get(account) ?? 0) >= 6) throw new HttpException("Too many open result streams. Close another tab and retry.", 429);
  streamCount++;
  perAccount.set(account, (perAccount.get(account) ?? 0) + 1);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  let closed = false;
  let reading = false;
  let again = false;
  let timer: NodeJS.Timeout | undefined;
  let lifetime: NodeJS.Timeout | undefined;
  let unsubscribe: (() => void) | undefined;
  const close = () => {
    if (closed) return; closed = true;
    clearInterval(timer); clearTimeout(lifetime);
    unsubscribe?.();
    streamCount--;
    const remaining = (perAccount.get(account) ?? 1) - 1;
    if (remaining) perAccount.set(account, remaining); else perAccount.delete(account);
    res.end();
  };
  const write = (value: T) => {
    if (closed) return;
    // Slow/disconnected readers must not accumulate an unbounded response buffer.
    if (res.writableLength > 128 * 1024) { close(); return; }
    res.write(`event: status\ndata: ${JSON.stringify(value)}\n\n`);
    if (terminal(value)) close();
  };
  const refresh = async () => {
    if (closed) return;
    if (reading) { again = true; return; }
    reading = true;
    try {
      do { again = false; write(await read()); } while (again && !closed);
    } catch { close(); }
    finally { reading = false; }
  };
  res.once("close", close);
  if (req.destroyed || res.destroyed) { close(); return; }
  write(initial);
  if (closed) return;
  try {
    unsubscribe = await subscribeStatus(channel, { refresh: () => void refresh(), close });
    if (closed) { unsubscribe(); return; }
    await refresh();
    if (closed) return;
    timer = setInterval(() => { if (!closed) { res.write(": heartbeat\n\n"); void refresh(); } }, 15_000);
    lifetime = setTimeout(close, 120_000);
  } catch { close(); }
}
