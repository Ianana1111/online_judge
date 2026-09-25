Every legal set element divides N. Adding every positive divisor increases the sum, and because N itself is included, the LCM remains N. Therefore MSLCM(N) is exactly `sigma(N)`.

Swap summations: `sum_{i=1..N} sigma(i) = sum_{d=1..N} d*floor(N/d)`. For current left, quotient q remains constant through `right=floor(N/q)`. Add q times the arithmetic sum of left through right, jump to right+1, and subtract `sigma(1)=1` at the end.

The required total reduces to Σ i·floor(N/i) minus the excluded constant. Equal quotients occupy a consecutive interval [left,N/quotient], so sum that arithmetic progression at once instead of iterating every i.
