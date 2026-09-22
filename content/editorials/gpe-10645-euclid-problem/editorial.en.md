# Find one Bézout solution, then optimize along all equivalent solutions

## Problem and constraints

For positive integers A and B at most 10⁹, find X, Y, and D such that `AX + BY = D = gcd(A,B)`. Minimize `|X| + |Y|`; if multiple minimum solutions remain, prefer the one satisfying X ≤ Y. Read pairs until EOF. Zero is outside this problem's stated input domain.

## Building the approach

Extended Euclid supplies one solution, but the problem asks for more than any Bézout coefficients. First compute a particular solution `(x₀,y₀)` while running the ordinary remainder algorithm: whenever a remainder becomes `r₀ − q r₁`, apply the same operation to its A and B coefficients.

All other solutions have the form `X = x₀ + k(B/D)` and `Y = y₀ − k(A/D)` for integer k. We can therefore optimize one integer variable instead of searching arbitrary coefficient pairs.

The objective is the sum of two absolute-value expressions. It is convex and piecewise linear, changing slope only when X or Y becomes zero. On a nonflat segment, moving toward the better endpoint cannot hurt. Thus testing integers immediately on either side of those two breakpoints includes an optimum. Use true mathematical floor, because C++ division truncates negative quotients toward zero.

Compare candidates first by absolute-value sum, then by the X ≤ Y tie rule. The equal-input case is an easy way to test that final requirement.

## Walkthrough

For A = 4 and B = 6, `X = −1, Y = 1` gives D = 2 with cost two. The valid pair `(2,−1)` has cost three and is not acceptable as a minimum. For A = B = 7, both `(1,0)` and `(0,1)` have cost one, so choose `0 1 7`.

## Why it works

Euclid's simultaneous coefficient updates preserve each remainder as a linear combination of A and B; the final nonzero remainder is their gcd. Subtracting two solutions and using coprimality of A/D and B/D gives exactly the one-parameter family above. Its piecewise-linear convex objective attains an integer minimum at a breakpoint-adjacent integer, or along a flat region whose endpoint neighbors include a minimum. Testing those candidates and applying the stated tie rule yields the required solution.

## Complexity

O(log min(A,B)) time for Euclid, followed by at most five shift candidates. Extra space is O(1). Coefficients and intermediate products use 64-bit integers.

## Common mistakes

- Printing arbitrary extended-Euclid coefficients without minimizing them.
- Treating negative truncation as floor.
- Returning `1 0 A` when A = B.
- Assuming the gcd is always one.
- Swapping A and B without swapping their coefficients.
