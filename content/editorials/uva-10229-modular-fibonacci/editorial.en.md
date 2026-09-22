# Use fast doubling to compute a huge Fibonacci index modulo a power of two

## Problem and constraints

The Fibonacci sequence is `F0=0`, `F1=1`, and `Fn=F(n-1)+F(n-2)`. For every pair `n m`, print the nonnegative remainder of `Fn` modulo `2^m`. Here `0 <= n <= 2147483647` and `0 <= m < 20`. Input continues until end of file; `0 0` is a valid case, not a terminator.

## Building the approach

The index can exceed two billion, so advancing through the sequence one term at a time is too slow. We need a way to double an index in constant work. If `a=Fk` and `b=F(k+1)`, Fibonacci identities give

`F(2k) = a * (2b-a)` and `F(2k+1) = a^2+b^2`.

This suggests a recursive function that returns the adjacent pair `(Fn,F(n+1))`. It first obtains the pair for `floor(n/2)`, applies the two doubling identities, and chooses the correct adjacent pair according to whether `n` is even or odd.

Every operation may be reduced modulo `2^m`, because addition and multiplication preserve congruence. The expression `2b-a` needs normalization before the C++ remainder operator is used. When `m=0`, the modulus is one, so even the base value for `F1` must be stored as `1 % mod = 0`.

## Walkthrough

For `n=10` and `m=3`, the modulus is eight. The recursive half-index pair corresponds to `F5=5` and `F6=8`, represented modulo eight as `(5,0)`. The even doubling formula computes

`F10 = 5 * (2*0-5) mod 8`.

After normalizing the negative factor, this becomes `5*3 mod 8 = 7`. The full number is 55, whose remainder modulo eight is also seven.

## Why it works

The base call returns `(F0,F1)` modulo the chosen modulus. Assume the recursive call correctly returns `(Fk,F(k+1))`. The Fibonacci addition identities derive exactly `F(2k)` and `F(2k+1)` from that pair. For an even index, those are the required adjacent results. For an odd index, the required pair is `(F(2k+1),F(2k+2))`, and the second value is the sum of the two doubled values.

Thus every recursive level returns the correct adjacent Fibonacci pair by induction. Replacing intermediate integers by congruent remainders does not change the final remainder, so the first member of the top-level pair is the requested answer.

## Complexity

Each call halves `n`, so the running time and recursion depth are `O(log(n+1))`. The stack uses `O(log(n+1))` space. Since the modulus is at most `2^19`, all products fit safely in `long long`.

## Common mistakes

- Using a linear loop for an index that can reach two billion.
- Returning the next Fibonacci number because of an indexing mismatch.
- Computing modulo `2*m` or `2^(m-1)` instead of `2^m`.
- Multiplying in 32-bit `int` before taking the modulus.
- Leaving `2*b-a` negative before applying `%` in C++.
- Treating `0 0` as the end of input or returning an unreduced one when the modulus is one.
