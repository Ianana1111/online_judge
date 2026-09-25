The large bound and parity-only output suggest working modulo 2. Let `d = n - m` and fix `m`. The ordinary generating function is

`sum S(m+d,m) x^d = product_{j=1..m} (1-jx)^(-1)`.

Modulo 2, every even `j` contributes the factor 1, while every odd `j` contributes `(1-x)^(-1)`. There are `c = ceil(m/2)` odd values, so the coefficient becomes

`C(d+c-1, c-1)`.

A binomial coefficient `C(a+b,b)` is odd exactly when adding `a` and `b` in binary creates no carries. Equivalently, `(a & b) == 0`. Substituting `a=d` and `b=c-1=floor((m-1)/2)` gives a constant-time bit test.

The derived parity is that of a binomial coefficient with addends n−m and floor((m−1)/2). By the binary carry criterion, it is odd exactly when those addends have no common set bit, so one bitwise AND suffices.
