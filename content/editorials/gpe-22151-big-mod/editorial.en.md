# Compute a huge power one binary exponent bit at a time

## Problem and constraints

For each triple, compute `B^P mod M`. The base and exponent are between zero and 2,147,483,647, while `1<=M<=46340`. Numbers may be separated by lines or blank lines, and input ends at EOF. Exponent zero represents the empty product one, still reduced modulo `M`; therefore modulus one always yields zero.

## Building the approach

The binary form of an exponent decomposes it into powers of two. For example, `13=8+4+1`, so only `B^8`, `B^4`, and `B` are needed. Repeated squaring produces exactly these powers.

Keep `result` as the product selected by processed bits and `base` as the current power-of-two residue. If the exponent's low bit is one, multiply `base` into `result`. Then square `base` modulo `M` and shift the exponent right. Initialize with `base=B mod M` and `result=1 mod M`; the latter correctly handles both zero exponent and modulus one.

Reducing after every multiplication is safe because modular multiplication respects congruence, and it prevents the full power from ever being formed.

## Walkthrough

For `3^5 mod 17`, binary 5 is `101`. The current bases are 3, 9, and 13. Select 3 and 13, producing `3*13 mod 17=5`, which matches `243 mod 17`.

For exponent zero the loop is skipped and returns `1 mod M`. When `M=1`, that initialized value is zero.

## Why it works

At every iteration, `result * base^exponent` is congruent to the original power. With an even exponent, squaring the base and halving the exponent preserves that product. With an odd exponent, first transfer one base factor into `result`, then apply the even transformation. The invariant holds initially and throughout.

When the remaining exponent reaches zero, its power is one, so `result` alone is the desired residue.

## Complexity

The exponent is halved each iteration, giving `O(log(P+1))` time and `O(1)` space.

## Common mistakes

- Using floating-point `pow`.
- Multiplying `P` times.
- Initializing with plain one and failing `P=0, M=1`.
- Squaring the unreduced original base.
- Taking a modulus only after an overflowing full power.
