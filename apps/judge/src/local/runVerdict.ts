import { OUTPUT_CAP_BYTES } from "./sandboxRun.js";

/** Shared resource/error classification for Submit and Run, before any output comparison. */
export function runtimeVerdict(run: {
  timedOut: boolean; exitCode: number; stderr: string; stdout: string; memoryKb: number | null;
}, memoryLimitKb: number): "TLE" | "MLE" | "RE" | "OLE" | undefined {
  if (run.timedOut) return "TLE";
  if (run.exitCode !== 0) {
    if (run.exitCode === 153) return "OLE";
    return /bad_alloc|cannot allocate memory|memoryerror|outofmemoryerror|std::length_error/i.test(run.stderr) ? "MLE" : "RE";
  }
  if (run.memoryKb !== null && run.memoryKb > memoryLimitKb) return "MLE";
  if (Buffer.byteLength(run.stdout) >= OUTPUT_CAP_BYTES) return "OLE";
  return undefined;
}
