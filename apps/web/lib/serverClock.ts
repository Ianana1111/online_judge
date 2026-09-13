let synchronizedAt = 0;
let serverEpoch = 0;

export function synchronizeServerClock(iso: string, requestStarted: number) {
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return;
  const arrived = performance.now();
  serverEpoch = timestamp + Math.max(0, arrived - requestStarted) / 2;
  synchronizedAt = arrived;
}

export function serverNow(): number {
  return serverEpoch ? serverEpoch + performance.now() - synchronizedAt : Date.now();
}
