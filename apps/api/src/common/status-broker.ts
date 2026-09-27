import { createRedisConnection } from "./redis.providers";

type Listener = { refresh: () => void; close: () => void };
const channels = new Map<string, Set<Listener>>();
let client: ReturnType<typeof createRedisConnection> | undefined;
function subscriber() {
  if (!client) {
    client = createRedisConnection();
    client.on("message", (channel: string) => { for (const listener of channels.get(channel) ?? []) listener.refresh(); });
    client.on("error", () => { for (const set of [...channels.values()]) for (const listener of [...set]) listener.close(); });
  }
  return client;
}

/** One Pub/Sub socket per API process, rather than one Redis connection per browser stream. */
export async function subscribeStatus(channel: string, listener: Listener) {
  const redis = subscriber();
  const set = channels.get(channel) ?? new Set<Listener>();
  channels.set(channel, set);
  set.add(listener);
  const unsubscribe = () => {
    set.delete(listener);
    if (set.size || channels.get(channel) !== set) return;
    channels.delete(channel);
    void redis.unsubscribe(channel).catch(() => {});
  };
  try { await redis.subscribe(channel); }
  catch (error) { unsubscribe(); throw error; }
  return unsubscribe;
}
