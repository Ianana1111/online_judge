`fibonacci` always returns two consecutive remainders. Structured binding names them `a` and `b`, matching the fast-doubling formulas. The recursive result for `n/2` is computed only once. An even index returns `(c,d)`; an odd index advances the pair by one position and returns `(d,c+d)` modulo `mod`.

The modulus is formed with `1LL << m`, and all multiplicative operands are `long long`. Because both `a` and `b` are already in `[0,mod-1]`, adding one copy of `mod` to `2*b-a` is enough to make it nonnegative before the final remainder operation.

The input loop ends only when extraction fails, so zero-valued records remain ordinary cases. Only the first component of the returned pair is printed, followed by exactly one newline.
