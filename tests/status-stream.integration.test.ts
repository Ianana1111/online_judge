import { createServer } from "node:http";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import type { Request, Response } from "express";
import { expect, it, vi } from "vitest";
import { serveStatusStream } from "../apps/api/src/common/status-stream";
import * as redisProviders from "../apps/api/src/common/redis.providers";
const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const Redis = requireApi("ioredis") as typeof import("../apps/api/node_modules/ioredis").Redis;

it.skipIf(process.env.RUN_DB_TESTS !== "1")("delivers 50 result streams over one Redis subscriber connection and caps tabs", async () => {
  if (process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable Redis required");
  const redis = new Redis(process.env.REDIS_URL), prefix = `stream-${randomUUID()}`;
  // Observe the real factory instead of counting every concurrent test's Redis sockets.
  const connections = vi.spyOn(redisProviders, "createRedisConnection");
  let done = false;
  const server = createServer((req, res) => {
    const account = req.url!.slice(1);
    Object.assign(req, { user: { id: account } });
    void serveStatusStream(req as Request, res as Response, `${prefix}:${account}`, async () => ({ status: done ? "DONE" : "RUNNING" }), (v) => v.status === "DONE")
      .catch((error) => { res.writeHead(error.getStatus?.() ?? 500).end(); });
  });
  const controllers: AbortController[] = [];
  try {
    await redis.ping();
    server.listen(0, "127.0.0.1"); await once(server, "listening");
    const port = (server.address() as { port: number }).port;
    const readers = await Promise.all(Array.from({ length: 50 }, async (_, n) => {
      const controller = new AbortController(); controllers.push(controller);
      const response = await fetch(`http://127.0.0.1:${port}/${n}`, { signal: controller.signal });
      expect(response.status).toBe(200);
      const reader = response.body!.getReader();
      const initial = await reader.read(); expect(Buffer.from(initial.value!).toString()).toContain("RUNNING");
      return reader;
    }));
    const channels = Array.from({ length: 50 }, (_, n) => `${prefix}:${n}`);
    await expect.poll(() => redis.pubsub("NUMSUB", ...channels), { timeout: 3000 })
      .toEqual(channels.flatMap((channel) => [channel, 1]));
    expect(connections).toHaveBeenCalledTimes(1);
    // Five extra tabs plus the original account-0 stream reach the per-account limit.
    for (let n = 0; n < 5; n++) {
      const controller = new AbortController(); controllers.push(controller);
      expect((await fetch(`http://127.0.0.1:${port}/0`, { signal: controller.signal })).status).toBe(200);
    }
    expect((await fetch(`http://127.0.0.1:${port}/0`)).status).toBe(429);
    done = true;
    await Promise.all(Array.from({ length: 50 }, (_, n) => redis.publish(`${prefix}:${n}`, "refresh")));
    await Promise.all(readers.map(async (reader) => {
      let output = "";
      while (true) { const part = await reader.read(); if (part.done) break; output += Buffer.from(part.value).toString(); }
      expect(output).toContain("DONE");
    }));
  } finally {
    controllers.forEach((c) => c.abort()); server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    for (const result of connections.mock.results) if (result.type === "return") result.value.disconnect();
    connections.mockRestore(); await redis.quit();
  }
});
