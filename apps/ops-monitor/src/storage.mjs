import { readBounded } from "./probes.mjs";
export function cloudStorage(bucket) {
  if (!/^[a-z0-9][a-z0-9._-]{2,62}$/.test(bucket ?? "")) throw new Error("Invalid state bucket");
  let token, expires = 0;
  const headers = async () => {
    if (!token || Date.now() >= expires) {
      const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" }, signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error("Service identity unavailable");
      const data = await response.json(); token = data.access_token; expires = Date.now() + Math.max(1, data.expires_in - 60) * 1000;
    }
    return { authorization: `Bearer ${token}` };
  };
  return {
    async read() {
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/status.json?alt=media`, { headers: await headers(), signal: AbortSignal.timeout(8000) });
      if (response.status === 404) return { state: null, generation: "0" };
      if (!response.ok) throw new Error("State read failed");
      const generation = response.headers.get("x-goog-generation");
      if (!generation) throw new Error("Missing object generation");
      return { state: JSON.parse(await readBounded(response)), generation };
    },
    async write(state, generation) {
      if (!/^\d+$/.test(generation)) throw new Error("Invalid object generation");
      const response = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=status.json&ifGenerationMatch=${generation}`, { method: "POST", headers: { ...await headers(), "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify(state), signal: AbortSignal.timeout(8000) });
      await response.body?.cancel();
      if (response.status === 412) return false;
      if (!response.ok) throw new Error("State write failed");
      return true;
    },
  };
}
