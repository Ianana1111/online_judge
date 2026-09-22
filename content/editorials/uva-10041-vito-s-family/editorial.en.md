# Derive the median by pairing relatives

## Problem and constraints

For each test case, choose a street position minimizing the sum of distances to R relatives, where 1 ≤ R ≤ 499 and positions lie between 1 and 29,999. Several relatives may share a position; each still contributes to the total. Print the minimum total distance, not the chosen position.

## Building the approach

The average is a familiar way to find a center, but this problem minimizes absolute distances, not squared distances. For positions `1, 1, 100`, choosing 1 costs 99, while the average 34 costs 132. An outlier should not pull the home that far away.

Instead, first consider just two positions a ≤ b. Any home between them gives total distance b − a; moving outside that interval makes the total larger. Sort all positions and pair the leftmost relative with the rightmost, then the next leftmost with the next rightmost.

To minimize every pair together, choose a point inside all those nested intervals. Their common intersection is the middle position for odd R, or the interval between the two middle positions for even R. In other words, choose a median. Then one pass sums the distances to that home.

## Walkthrough

For `2, 4, 6`, pair 2 with 6. Every home from 2 through 6 gives their combined distance 4, and choosing 4 also gives the remaining relative distance zero. The answer is 4. For `1, 1, 100`, the median is 1, so the answer is 0 + 0 + 99 = 99. A single relative gives zero.

## Why it works

Each extreme pair contributes at least the distance between its endpoints. A median lies inside every pair's interval, attaining every lower bound simultaneously. With an odd number of relatives it also coincides with the unpaired middle relative. Hence no other home can have a smaller total.

## Complexity

Sorting takes O(R log R) time; summing takes O(R). The stored positions use O(R) space.

## Common mistakes

- Choosing the arithmetic mean.
- Removing duplicate positions and losing relatives.
- Printing the median instead of the sum of distances.
- Treating the even-sized case as requiring a unique best home.
