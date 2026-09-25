Divisibility depends only on remainder modulo `K`. Two partial sums with the same remainder have identical possibilities after every future addition or subtraction, so at most `K` states need to survive each step.

Let `possible[r]` mean that some sign choices for the processed prefix produce remainder `r`. Initialize it with the normalized remainder of the first number. For every later value, create a fresh empty `next` and, from each reachable `r`, mark both `(r+value) mod K` and `(r-value) mod K`.

Normalize negative inputs into `0..K-1`. A fresh next array is essential: carrying old states would allow skipping the current value, while in-place updates could reuse it multiple times.

Each input creates a fresh remainder layer, so it is used exactly once. C and Java normalize negative remainders into valid array indices.
