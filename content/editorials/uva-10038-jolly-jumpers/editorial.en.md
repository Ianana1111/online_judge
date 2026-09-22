# Check the differences, not the numbers

## Problem and constraints

Each sequence contains N integers, with 1 ≤ N ≤ 3,000. Take the absolute difference between every pair of adjacent values. The sequence is Jolly exactly when these N − 1 differences contain every integer from 1 through N − 1 once. Values may be negative or repeated. Read sequences until EOF; a sequence of length one is Jolly.

## Building the approach

Start by separating the input numbers from what the question actually checks: their adjacent differences. Sorting the input would destroy those adjacencies, so keep its order.

There are N − 1 differences and N − 1 required values. That matching count is useful: if each difference lies in the required range and none repeats, there is no room for a missing value. We do not need a separate search for every required difference.

Use a Boolean array indexed by the difference. For each new number, compare it with the previous number, reject zero or a difference at least N, and otherwise check whether that index has already been seen. A sum alone is insufficient: repeated differences can compensate for missing ones.

Even after detecting a failure, keep reading the remaining numbers. Otherwise they would be mistaken for the next sequence's length.

## Walkthrough

For `1 4 2 3`, the differences are 3, 2, and 1. All are distinct and inside 1 through 3, so print `Jolly`. For `1 2 3 4`, every difference is 1; the second occurrence already proves the sequence is `Not jolly`. With one number there are no differences to inspect and no required values missing.

## Why it works

After each adjacent pair, the array records exactly the valid differences encountered so far. An out-of-range or repeated difference makes the required collection impossible. Conversely, N − 1 distinct values chosen from a set of size N − 1 must equal that entire set. These are exactly the conditions checked by the algorithm.

## Complexity

O(N) time and O(N) space per sequence. Only the previous number is needed; storing all input values is unnecessary.

## Common mistakes

- Sorting the original sequence before taking differences.
- Checking only the sum or the largest difference.
- Indexing the array before rejecting an out-of-range difference.
- Stopping input consumption as soon as a sequence fails.
- Rejecting the empty collection of differences when N = 1.
