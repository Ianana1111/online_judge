`fact` and `inv` supply combination values modulo the prime modulus. The inverse factorial at the largest index is found by modular exponentiation, then propagated backward. The early `n >= k*x` test leaves impossible cases at their zero-initialized answer.

One-box and X = 1 cases are handled directly. Other queries are grouped by `(k,x)` while their original indices are retained for final output order.

For a general group, `binomial[balls]` stores `C(balls-1,x-1)`. `previous[0] = 1` is the zero-box base. The term `current[balls-1]` represents the more-than-X case at the same box count; `previous[balls-x]` represents removing an exactly-X box. Ascending `balls` makes the first dependency ready, while separate rows preserve the second.

`last = n - (k-boxes)*x` reserves the minimum marbles required by remaining boxes. After swapping rows, the final `previous` contains answers for every requested N in the group. Case indices restore the original query order.
