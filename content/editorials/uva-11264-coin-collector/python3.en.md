Any solution using multiple copies of one denomination can discard extra copies without losing a type. The smaller amount is less likely to trigger a larger coin, so it is enough to seek a representation containing one coin of each chosen type.

Scan denominations from smallest upward and let `sum` be the smallest amount representing the types selected so far. Include `coin[i]` only if `sum + coin[i] < coin[i+1]`. Equality is not enough: if the remaining amount reaches the next denomination, the bank takes that larger coin first. The greatest denomination is always included at the end because no larger type can displace it.

The `n - 1` comparisons omit the largest denomination, which has no larger coin to displace it.
