import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ServiceUnavailableException } from "@nestjs/common";

export function securityKey(): Buffer {
  const raw = process.env.ACCOUNT_SECURITY_KEY;
  if (!raw || !/^[a-f\d]{64}$/i.test(raw)) throw new ServiceUnavailableException("Account security is not configured. Please contact support.");
  return Buffer.from(raw, "hex");
}

export function digestToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Context binds encrypted material to its account and use, preventing ciphertext swapping.
export function sealSecret(value: string, context: string): string {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", securityKey(), iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function openSecret(value: string, context: string): string {
  const [version, iv, tag, ciphertext, extra] = value.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext || extra) throw new Error("Invalid encrypted secret");
  const decipher = createDecipheriv("aes-256-gcm", securityKey(), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}
