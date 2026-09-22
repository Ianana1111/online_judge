Factorials are precomputed through 1000. The inverse of `1000!` comes from Fermat's theorem, and lower inverse factorials follow from `(n-1)!^{-1}=n*n!^{-1}`. `choose` takes the modulus between multiplications.

`valid` evaluates inclusion-exclusion for one selected required set. The bounds guarantee a nonnegative factorial index. Odd terms add `MOD` before subtraction, and the final multiplication by `choose(m,k)` accounts for every possible required fixed set.
