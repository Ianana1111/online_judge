Each physical line is parsed as one sequence. Only `values == [0]` ends the full input; for a normal sequence, `pop()` removes that line's terminating zero.

The gcd accumulator begins at zero and receives each nonnegative difference from `first`. The custom Euclidean loop repeatedly replaces `(a,b)` with `(b,a%b)` until the remainder is zero, returning the exact greatest common divisor.

Python integers preserve a difference between large positive and negative values without fixed-width overflow. Because the problem guarantees that at least one difference is nonzero, the printed accumulator is always a positive divisor.
