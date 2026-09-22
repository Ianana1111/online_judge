The prime vector has 2001 entries, so the maximum legal frequency is directly indexable. Sieve loops stop after the square-root boundary because every remaining composite already has a smaller factor.

`array<int,128> count{}` value-initializes all counts to zero for each case. Iteration uses `unsigned char` and performs no case conversion; every valid alphanumeric input is within ASCII range.

Scanning codes upward queries `prime[count[ch]]`, so absent characters with count zero are excluded and qualifying characters are already sorted. `answer.empty()` selects the required fallback word.
