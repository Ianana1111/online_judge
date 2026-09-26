There are only `26^3=17576` ordered candidate strings. Precompute `next[i][c]`, the earliest position at or after `i` containing letter c, or sentinel n when absent. Build it right-to-left by copying the next row and replacing the current character's entry.

For candidate a,b,c, jump to the earliest a from zero, then earliest b starting after that position, then c after b. Count the candidate exactly once if all three exist.

There are only 26³ possible three-letter results. Test each as a subsequence by greedily taking the earliest later occurrence of each required letter; this counts each result exactly once.

Java stores the next-position table in one contiguous int array and reuses it across cases, avoiding 100000 row objects and old tables awaiting collection. Row i and letter c use index i×26+c; the recurrence and result are unchanged.
