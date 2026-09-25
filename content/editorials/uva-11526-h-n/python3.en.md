For positive `n`, `floor(n/i)` counts positive integers `j` satisfying `i*j<=n`, so the sum counts ordered lattice points under a hyperbola. Let `r=floor(sqrt(n))`. No valid point can have both `i>r` and `j>r`.

Count the strip `i<=r` as `S=sum_{i=1}^r floor(n/i)`. By symmetry, the strip `j<=r` also has `S` points. Their intersection is the complete `r x r` square, since every product there is at most `r^2<=n`. Inclusion-exclusion gives `H(n)=2S-r^2`.

Use floating square root only as an estimate, then correct it with integer comparisons. Handle nonpositive values before taking a root.

For nonpositive input, the original sum is empty and yields zero; `math.isqrt` gives the exact positive boundary.
