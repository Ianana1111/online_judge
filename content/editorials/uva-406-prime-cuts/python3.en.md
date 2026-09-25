Use a sieve to precompute genuine primes through 1000. For each case, form an increasing array beginning with the special value 1, followed by all primes at most `N`.

Let its length be `L`. The requested count is

`K = min(L, 2*C - L%2)`.

The parity subtraction changes an odd-length list's requested count from `2C` to `2C-1`. To center a consecutive block of `K` elements, remove the same number from both ends, so its start index is `(L-K)/2`. Print the next `K` entries. If `K == L`, this formula naturally starts at zero.

The displayed list includes one; take 2C−1 items if its length is odd, 2C if even, or all items if fewer.
