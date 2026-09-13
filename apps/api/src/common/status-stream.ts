import type { Request, Response } from "express";
import { createRedisConnection } from "./redis.providers";

/** Subscribe before rereading durable state. Pub/sub is a wakeup, never the source of truth. */
export async function serveStatusStream<T>(req: Request, res: Response, channel: string,
  read: () => Promise<T>, terminal: (value: T) => boolean) {
  const initial = await read(); // Authenticate and return normal HTTP errors before streaming.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  let closed = false;
  let reading = false;
  let again = false;
  let timer: NodeJS.Timeout | undefined;
  let lifetime: NodeJS.Timeout | undefined;
  const subscriber = createRedisConnection();
  const close = () => {
    if (closed) return; closed = true;
    clearInterval(timer); clearTimeout(lifetime);
    subscriber.disconnect();
    res.end();
  };
  const write = (value: T) => {
    if (closed) return;
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
  subscriber.on("error", close);
  subscriber.on("message", () => void refresh());
  write(initial);
  if (closed) return;
  try {
    await subscriber.subscribe(channel);
    if (closed) { subscriber.disconnect(); return; }
    await refresh();
    if (closed) return;
    timer = setInterval(() => { if (!closed) { res.write(": heartbeat\n\n"); void refresh(); } }, 15_000);
    lifetime = setTimeout(close, 120_000);
  } catch { close(); }
}
