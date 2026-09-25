All possible values are below ten million, so build one sieve for `[0,10^7)` before processing cases. For one case, store how many copies of each digit remain. DFS keeps the current value and used length; every visited nonempty prefix is a candidate, because unused fragments may be ignored.

Branch once per digit value with positive remaining count, decrement before recursion, and restore afterward. Disallow zero as the first digit. This frequency-based search avoids duplicate branches from interchangeable copies, while the no-leading-zero rule gives each numeric value its unique ordinary decimal representation.

Sieve primes below ten million, then backtrack using digit frequencies and forbid a leading zero. Each generated prefix uniquely represents one integer, so a prime prefix can be counted immediately without a large deduplication set.
