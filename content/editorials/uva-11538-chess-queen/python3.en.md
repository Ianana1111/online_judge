Swap dimensions so `m<=n`. Ordered pairs sharing a row or column total

`mn(n-1) + mn(m-1) = mn(m+n-2)`.

For one diagonal direction, lengths 1 through `m-1` each occur twice, and length `m` occurs `n-m+1` times. A diagonal of length `L` contributes `L(L-1)` ordered pairs. Both directions therefore contribute

`4 * sum_{L=1}^{m-1} L(L-1) + 2(n-m+1)m(m-1)`.

Using `sum L(L-1)=m(m-1)(m-2)/3` gives constant-time arithmetic. These attack classes are disjoint for two distinct cells, so their counts add directly.

Integer division by three applies to the exact diagonal term, avoiding floating-point error.
