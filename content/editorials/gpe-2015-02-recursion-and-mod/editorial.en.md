# Shift the recurrence, then use binary exponentiation

## Problem and constraints

The sequence satisfies `f(1)=1` and `f(n)=3f(n-1)+4` for `n>1`. For each input `0<n<2^63`, print `f(n)` modulo `1,000,000,009`. There may be up to 1,000 queries and input ends at EOF. Iterating to such a large index is impossible, and constructing the full integer value is unnecessary.

## Building the approach

The added constant prevents the recurrence from being a pure geometric sequence. Try shifting by a constant `c`: requiring `f(n)+c = 3(f(n-1)+c)` gives `4+c=3c`, so `c=2`.

Define `g(n)=f(n)+2`. Then `g(n)=3g(n-1)` and `g(1)=3`, hence `g(n)=3^n` and `f(n)=3^n-2`.

Compute `3^n mod MOD` with binary exponentiation. Read the exponent one binary bit at a time. When the low bit is one, multiply the current base into the result. Square the base and shift the exponent right each round. Every product is reduced immediately, so only about 63 iterations are needed.

Finally normalize subtraction with `(power-2+MOD)%MOD`, because C++ may return a negative remainder for a negative operand.

## Walkthrough

For `n=4`, the formula gives `3^4-2=79`, matching the recurrence values `1,7,25,79`. Binary exponentiation sees `4` as binary `100`: the base progresses from 3 to 9 to 81, and 81 is multiplied into the result at the set bit.

For `n=1`, the same formula yields `3-2=1`; no special-case correction is needed. Using exponent `n-1` would already fail this smallest input.

## Why it works

By induction from `g(1)=3` and `g(n)=3g(n-1)`, we obtain `g(n)=3^n`, so the closed form for `f` is exact.

Binary exponentiation maintains that the accumulated result multiplied by the current base raised to the remaining exponent is congruent to the original `3^n`. Removing an odd factor into the result, then squaring the base and halving the remaining exponent, preserves this invariant. When the exponent reaches zero, the result is the desired power modulo `MOD`; subtracting two yields the requested sequence value.

## Complexity

Each query takes `O(log n)` time and `O(1)` extra space. Reduced factors are below the modulus, so their product fits signed 64-bit range.

## Common mistakes

- Using the common modulus `1,000,000,007` instead of this problem's `1,000,000,009`.
- Advancing the recurrence `O(n)` times.
- Using floating-point `pow` for modular arithmetic.
- Multiplying in 32-bit storage before taking the modulus.
- Returning a negative remainder after subtracting two.
