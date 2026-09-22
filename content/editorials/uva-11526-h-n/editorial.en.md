# Count lattice points in two symmetric strips under a hyperbola

## Problem and constraints

Compute `H(n)=sum_{i=1}^n floor(n/i)` for a signed 32-bit input. For zero or negative `n`, the original loop executes zero times and the answer is zero. Positive values can approach `2^31`, making a direct `n`-iteration loop too slow.

## Building the approach

For positive `n`, `floor(n/i)` counts positive integers `j` satisfying `i*j<=n`, so the sum counts ordered lattice points under a hyperbola. Let `r=floor(sqrt(n))`. No valid point can have both `i>r` and `j>r`.

Count the strip `i<=r` as `S=sum_{i=1}^r floor(n/i)`. By symmetry, the strip `j<=r` also has `S` points. Their intersection is the complete `r x r` square, since every product there is at most `r^2<=n`. Inclusion-exclusion gives `H(n)=2S-r^2`.

Use floating square root only as an estimate, then correct it with integer comparisons. Handle nonpositive values before taking a root.

## Walkthrough

For `n=5`, `r=2` and `S=5+2=7`, so the answer is `14-4=10`, matching `5+2+1+1+1`. For `n=4`, the shared 2-by-2 square still contains four points and must be subtracted. Any nonpositive input returns zero.

## Why it works

Each term pairs index `i` with exactly the valid positive `j`, making the sum and lattice-point count identical. By the definition of `r`, every valid point lies in at least one of the two counted strips. Their intersection contains exactly all pairs with both coordinates from 1 through `r`, all valid, so subtracting `r^2` removes every duplicate once. This proves the formula.

## Complexity

Each positive case performs `O(sqrt n)` divisions and uses `O(1)` extra space. Accumulation requires 64-bit integers.

## Common mistakes

- Looping all the way through `n`.
- Doubling one strip without subtracting the shared square.
- Taking a square root of a nonpositive input or replacing negatives by their magnitude.
- Accumulating in 32-bit arithmetic.
- Trusting an uncorrected floating-point square root at exact-square boundaries.
