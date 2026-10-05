export type ProbeResult = { id: string; name: string; ok: boolean; httpStatus: number | null; latencyMs: number };
export function probeAll(options?: { webOrigin?: string; apiOrigin?: string; request?: typeof fetch }): Promise<ProbeResult[]>;
export function readBounded(response: Response, maxBytes?: number): Promise<string>;
