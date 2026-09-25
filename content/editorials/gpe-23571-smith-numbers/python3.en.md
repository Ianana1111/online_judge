Test candidates beginning at `n+1`. Preserve the original candidate for its digit sum and factor a separate `remaining` value by trial division. For each divisor, repeatedly divide while it fits, adding that divisor's digit sum and increasing the total factor count for every occurrence.

When `divisor^2` exceeds the current remainder, any remainder greater than one is itself the final prime factor. If it were composite, it would have a smaller factor that should already have been found.

A candidate is Smith exactly when the two digit sums match and the prime-factor count is greater than one. The count condition excludes primes and one. Scanning consecutive candidates ensures the first match is the required successor.

Search from n+1 upward. Count the digit sum of every prime-factor occurrence, including repeats; require more than one factor so primes are excluded.
