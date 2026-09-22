Palindrome states use inclusive endpoints, while `groups` uses prefix lengths; consequently the final interval is `[begin,end-1]`. Short-circuiting on lengths below two avoids invalid interior indices.

`groups` begins above any possible answer except for `groups[0]=0`. Increasing `end` guarantees all earlier prefix answers are complete. Only table-confirmed palindrome intervals update the state, and `groups[n]` is the required group count.
