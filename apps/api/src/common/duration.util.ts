/**
 * Parses simple duration strings like "15m", "7d", "30s", "500ms" (as used by
 * JWT_ACCESS_TTL / JWT_REFRESH_TTL in .env.example) into milliseconds.
 * A bare number is treated as milliseconds.
 */
export function parseDurationMs(input: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${input}"`);
  }
  const value = Number(match[1]);
  const unit = (match[2] ?? "ms").toLowerCase();
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit];
}
