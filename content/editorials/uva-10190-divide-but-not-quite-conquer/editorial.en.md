# Divide only when exact, and print only after reaching one

## Problem and constraints

Given nonnegative `n` and `m` below two billion, repeatedly divide the current value by m. A valid sequence begins with n, ends exactly at one, every division is exact, and values strictly decrease. Print the complete sequence or `Boring!`. This platform requires at least one division, so `n<=1` or `m<=1` is boring. Input ends at EOF; `0 0` is a case, not a terminator.

## Building the approach

Reject `n<=1` and `m<=1` first. This prevents division by zero, nondecreasing loops for one, and the locally disallowed zero-division singleton.

Start a stored sequence with n. While the current value exceeds one and is divisible by m, divide exactly and append the quotient. When the loop ends, success occurs only if the current value is one. Otherwise a nonzero remainder prevented the uniquely determined next step.

Do not print values as they are generated. A sequence may remain exact for several steps and then fail; buffering lets the entire partial result be discarded in favor of the single failure phrase.

## Walkthrough

For `125 5`, the sequence is `125 25 5 1`. For `30 3`, the first quotient is ten but ten is not divisible by three, so the whole result is `Boring!`.

For `80 2`, exact division reaches five before failing. Blind integer truncation would incorrectly continue through two to one. When `n=m>1`, one division produces the valid two-term sequence `n 1`.

## Why it works

The stored sequence starts correctly. Before every extension, divisibility is verified, and because `m>1`, the exact quotient is strictly smaller. Thus every appended relation satisfies both conditions.

Reaching one proves a complete valid sequence. If a current value above one is not divisible by m, the next value is fixed by the rules and cannot be replaced with another choice, so no complete valid sequence exists. The two output branches are therefore exact.

## Complexity

Every successful division reduces the value by at least half, so time and buffered sequence space are `O(log n)`.

## Common mistakes

- Using truncated integer division without a remainder check.
- Taking modulo by zero or looping forever at m=1.
- Treating `0 0` as a terminator.
- Printing a partial sequence before discovering failure.
- Accepting n=1 against the platform's nontrivial-sequence rule.
