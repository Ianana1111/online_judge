First choose which `K` of the first `M` positions are fixed, in `C(M,K)` ways. After fixing them, `N-K` values remain, but the other `M-K` early positions must not become fixed. Treat each such unwanted fixed point as a bad event and use inclusion-exclusion.

If a chosen set of `j` bad positions is also forced fixed, choose it in `C(M-K,j)` ways and freely permute the other `N-K-j` values, giving `(N-K-j)!`. Thus the count for one chosen required set is

`sum (-1)^j C(M-K,j) (N-K-j)!`.

Multiply by `C(M,K)`. Precomputed factorials and modular inverse factorials make each combination constant time.

Choose which K of the first M positions are fixed, then use inclusion-exclusion to forbid any other fixed position among the remaining M−K. Each selected forbidden event leaves (N−K−j)! permutations, with alternating signs.
