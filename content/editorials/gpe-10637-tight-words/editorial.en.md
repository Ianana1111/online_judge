# Remember only the last digit when extending a word

## Problem and constraints

Use the digits zero through K, giving K + 1 possible symbols. A length-N word is tight when every adjacent pair differs by at most one. For 0 ≤ K ≤ 9 and 1 ≤ N ≤ 100, print the percentage of all equally likely words that are tight, with five decimal places. Leading zeros are allowed because these are strings, not N-digit positive integers.

## Building the approach

To decide which digit can be appended, we do not need the entire prefix: only its final digit matters. Let `counts[d]` be the number of valid words of the current length ending in d.

At length one, every symbol is valid, so every count starts at one. From ending d, append d − 1, d, or d + 1 whenever it stays within [0,K]. Accumulate into a fresh next array; updating in place would extend some words more than once in a single length step.

After reaching N, sum the ending counts and divide by `(K+1)^N`, the total number of words. Multiply by 100 for a percentage. Keeping exact integer counts until final rational rounding avoids accumulated floating-point error and preserves very small probabilities.

## Walkthrough

For K = 2 and N = 2, there are nine words. Only `02` and `20` fail, giving `7/9 × 100 = 77.77778` after rounding. At N = 1, every word works, so print `100.00000`. When K is zero or one, every possible adjacent pair also satisfies the condition for any N.

## Why it works

The initial counts represent every one-symbol word exactly once. Any longer valid word has a unique shorter prefix and final digit, with the final difference at most one. The transition enumerates exactly those extensions without duplicates. Induction proves the counts at length N, and dividing their sum by the total equally likely words gives the probability.

## Complexity

O(N(K+1)) big-integer additions and O(K+1) stored big integers. Values have O(N) decimal digits under these bounds, so their arithmetic costs are not unconditionally constant.

## Common mistakes

- Using alphabet size K instead of K + 1.
- Forgetting equal adjacent digits are allowed.
- Updating the count array in place.
- Excluding leading zeros.
- Printing probability instead of percentage or dividing integers too early.
