Scanning all eight-digit numbers would require one hundred million checks, but every answer must already be a square. Let `b=10^(digits/2)`. Any allowed numeric value `x` satisfies `0<=x<b^2`, with halves `x/b` and `x%b`.

Enumerate its nonnegative square root `r` from zero through `b-1`, set `x=r^2`, and test whether `x/b + x%b == r`. There are only 10,000 roots at the largest width. Since nonnegative squares increase with their roots, results are automatically ordered.

Numeric calculations do not retain leading zeros, so format every accepted value with exactly `digits` positions and zero fill.

Pad output with leading zeros to the requested width; zero can also be valid.
