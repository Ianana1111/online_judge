import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const CSRF_SECRET = process.env.CSRF_SECRET ?? "dev_csrf_secret_change_me";

/**
 * Stateless double-submit CSRF token: `${random}.${hmac(random)}`. The guard checks that the
 * `x-csrf-token` header matches the `csrf_token` cookie AND that the signature verifies against
 * CSRF_SECRET, so a value can't be forged even if an attacker somehow guessed/observed a random
 * token shape (belt-and-braces on top of the double-submit-cookie pattern itself).
 */
export function generateCsrfToken(): string {
  const raw = randomBytes(24).toString("hex");
  const sig = createHmac("sha256", CSRF_SECRET).update(raw).digest("hex");
  return `${raw}.${sig}`;
}

export function verifyCsrfToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [raw, sig] = parts;
  const expected = createHmac("sha256", CSRF_SECRET).update(raw).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(sigBuf, expectedBuf);
}
