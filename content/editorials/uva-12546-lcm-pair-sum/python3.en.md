Consider all ordered valid pairs and sum only their first component; call this `A`. For every unequal unordered pair, its two orders contribute `p+q` to `A`. The only equal pair is `(n,n)`, for which `A` contributes only `n` instead of `2n`, so the requested answer is `A+n`.

For a prime power `r^a`, exponent choices `i,j` must satisfy `max(i,j)=a`. If `i<a`, then `j` must be `a`, contributing `r^i` once. If `i=a`, then `j` has `a+1` choices, contributing `(a+1)r^a`. Thus this prime's factor is `1+r+...+r^(a-1)+(a+1)r^a`. Multiply these independent factors to obtain `A`, while separately multiplying `r^a` to obtain `n` modulo the modulus.

Sum first elements over ordered valid pairs by multiplying each prime’s allowed exponent contribution. Symmetry converts that total to the unordered p≤q sum, with the unique diagonal pair (n,n) contributing one additional n.
