/** Per-field output contracts. Exact rational midpoint checks accept either nearest
 * printed decimal at a true tie, without accepting adjacent digits elsewhere. */
export type RoundedField = { numerator: bigint; denominator: bigint; places: number };
export type ApproximateField = { value: number; error: number; places: number };
export type OutputField = string | RoundedField | ApproximateField;
export const rounded = (numerator: bigint, denominator: bigint, places: number): RoundedField => {
  if (denominator === 0n) throw new Error("Zero judge denominator");
  return denominator < 0n ? { numerator: -numerator, denominator: -denominator, places } : { numerator, denominator, places };
};
const abs = (value: bigint) => value < 0n ? -value : value;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function checkOutputRows(rows: OutputField[][], actual: string): boolean {
  const lines = actual.replace(/\r\n/g, "\n").split("\n").map(line => line.replace(/[ \t]+$/, ""));
  let first = 0, end = lines.length;
  while (first < end && lines[first] === "") first++;
  while (end > first && lines[end - 1] === "") end--;
  let last = rows.length;
  while (last && rows[last - 1].every(field => field === "")) last--;
  if (end - first !== last) return false;
  for (let i = 0; i < last; i++) {
    const fields = rows[i].filter((field): field is RoundedField | ApproximateField => typeof field !== "string");
    const pattern = rows[i].map(field => typeof field === "string" ? escape(field) : `([+-]?\\d+\\.\\d{${field.places}})`).join("");
    const match = new RegExp(`^${pattern}$`).exec(lines[first + i]);
    if (!match) return false;
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j], text = match[j + 1];
      if ("numerator" in field) {
        const scale = 10n ** BigInt(field.places), target = field.numerator * scale;
        const digits = text.replace(/[+.-]/g, "").replace(/^0+/, "") || "0";
        // Bound untrusted integer parsing by the actual answer's magnitude.
        if (digits.length > (abs(target) / field.denominator).toString().length + 1) return false;
        const supplied = BigInt(digits) * (text[0] === "-" ? -1n : 1n);
        if (2n * abs(supplied * field.denominator - target) > field.denominator) return false;
      } else {
        if (!Number.isFinite(field.value) || !Number.isFinite(field.error) || field.error < 0) throw new Error("Invalid numeric judge interval");
        const supplied = Number(text);
        if (!Number.isFinite(supplied) || Math.abs(supplied - field.value) > 0.5 * 10 ** -field.places + field.error) return false;
      }
    }
  }
  return true;
}

/** Exact finite decimal equivalence, including exponent notation. No binary floats,
 * enormous powers or attacker-sized BigInts are needed to normalize a number. */
export function decimalKey(text: string): string | null {
  const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match) return null;
  const fraction = match[3] ?? match[4] ?? "", raw = (match[2] ?? "") + fraction;
  const nonzero = raw.replace(/^0+/, "");
  if (!nonzero) return "0";
  const exponent = Number(match[5] ?? "0");
  if (!Number.isSafeInteger(exponent)) return null;
  const digits = nonzero.replace(/0+$/, ""), scale = fraction.length - exponent - (nonzero.length - digits.length);
  if (!Number.isSafeInteger(scale)) return null;
  return `${match[1] === "-" ? "-" : ""}${digits}e${-scale}`;
}
