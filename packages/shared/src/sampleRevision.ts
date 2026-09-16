/** Bind a Run result to the exact public sample shown in the editor, including its answer.
 * Web Crypto is available in both the browser and the supported Node runtimes. */
export async function sampleRevision(input: string, output: string): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify([input, output]));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
