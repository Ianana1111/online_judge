# Choose OR bits from most significant to least significant

## Problem and constraints

Given unsigned 32-bit integers `N`, `L`, and `U` with `L<=U`, choose `M` in `[L,U]` that maximizes `N OR M`. If several values attain the same maximum, return the smallest `M`. Values may include zero and `2^32-1`, so signed 32-bit storage is insufficient. The interval can contain billions of values and input continues to EOF.

## Building the approach

Binary values are ordered by their highest differing bit. We can therefore decide `M` from bit 31 down to bit 0, while keeping the already chosen high prefix and asking whether lower bits can still complete a value inside the interval.

When the current bit of `N` is zero, setting the bit of `M` improves the OR at the most significant undecided position. We should do so whenever the smallest number with that prefix, `mask|bit`, does not exceed `U`. This cannot lose the lower bound: raising the prefix only helps reach `L`, and lower bits remain available.

When `N` already has the bit, either choice gives the same OR bit. The tie rule prefers zero in `M`. It is forced to one only if leaving it zero and setting every lower bit, represented by `mask|(bit-1)`, still cannot reach `L`.

## Walkthrough

For `N=100`, `L=50`, and `U=60`, the construction fills bits missing from `N` whenever the upper bound permits and returns `M=59`, making the OR equal 127.

For `N=7`, `L=2`, and `U=6`, every interval value ORs with 7 to produce 7. The correct tie result is the smallest legal value, 2; blindly setting all available bits would be wrong.

## Why it works

Suppose the current high prefix agrees with an optimal completion. If an `N`-zero bit can legally be one, every completion with one has a larger OR than every completion with zero, because that bit outweighs all lower bits. The upper-bound test exactly checks the smallest such completion, while lower-bound reachability is preserved.

For an `N`-one bit, the OR is tied. Zero is therefore preferred unless even the largest possible lower suffix remains below `L`; in that case every legal completion must set the bit. Each decision preserves at least one legal completion and the best OR with the smallest prefix. After all bits, the constructed mask is the required `M`.

## Complexity

Exactly 32 bits are examined, so time is `O(32)` and extra space is `O(1)`.

## Common mistakes

- Maximizing OR without applying the smallest-`M` tie rule.
- Setting an `M` bit when the corresponding `N` bit is already one.
- Checking only the upper bound and finishing below `L`.
- Reading `2^32-1` into signed `int` or computing `1<<31`.
- Enumerating every number in the interval.
