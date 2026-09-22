# Sieve possible frequencies and scan characters in ASCII order

## Problem and constraints

Each case is an alphanumeric ASCII string of length one through 2000. Print every character whose occurrence count is prime, ordered by increasing ASCII value; print `empty` if none qualify. Uppercase and lowercase characters are distinct, and primality applies to the frequency rather than the character's numeric meaning.

## Building the approach

Precompute primality for every possible frequency from zero through 2000. Mark zero and one nonprime, then use the Sieve of Eratosthenes to remove multiples beginning at each prime's square.

For one case, count characters in a fixed 128-entry array. Scan indices from zero upward and append the character whenever `prime[count[ch]]` is true. This single scan produces ASCII order automatically: digits, then uppercase letters, then lowercase letters.

A fresh zeroed count array is required for every test case.

## Walkthrough

In `AABBBBDDDDD`, frequencies are two for A, four for B, and five for D. Two and five are prime while four is not, so the answer is `AD`.

In `ABCDFFFF`, frequencies are only one or four, neither prime, so the required output word is `empty` rather than a blank result.

## Why it works

The sieve never removes a prime because only multiples with two factors greater than one are marked. Every composite has a prime factor no greater than its square root and is therefore marked by that factor. The resulting table exactly identifies prime frequencies.

Counting visits each input character once, so every array entry is its exact occurrence count. The final scan selects precisely entries with prime counts, and increasing numeric character codes guarantee the required ASCII ordering.

## Complexity

With `U=2000`, preprocessing is `O(U log log U)`. A case of length `L` takes `O(L+128)` time and `O(128)` counting space; the prime table uses `O(U)`.

## Common mistakes

- Treating frequency one as prime.
- Sorting by count or first appearance rather than ASCII value.
- Combining uppercase and lowercase counts.
- Reusing counts from the previous case.
- Testing only divisibility by two and accepting odd composites.
