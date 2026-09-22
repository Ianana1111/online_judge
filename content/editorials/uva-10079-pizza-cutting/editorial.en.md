# Count the regions created by the next cut

## Problem and constraints

Find the maximum number of regions obtainable with N straight cuts through a circular pizza. Pieces stay in place and need not have equal area. The platform allows 0 ≤ N ≤ 210,000,000; any negative input ends the sequence. Zero cuts leaves one region.

## Building the approach

Trying to draw the final arrangement for a large N is difficult. Ask a smaller question: how many new regions can the kth cut create?

It can intersect each of the previous k − 1 lines at most once. Those intersection points split the new cut into at most k segments. Each segment crosses one existing region and splits it into two, so the new cut adds at most k regions. It does not generally double the total.

We can achieve the bound by arranging the lines so their intersections lie inside the pizza, no two are parallel, and no three meet at one point. Starting from one region, the answer is therefore `1 + 1 + 2 + ... + N = 1 + N(N + 1)/2`. This direct formula is essential when N reaches hundreds of millions.

## Walkthrough

The first cut adds one region, the second adds two, and the third can add three: the totals are 2, 4, and 7. With five cuts the formula gives 16. If all five cuts pass through the same center, they waste intersections and do not achieve the maximum.

## Why it works

The intersection argument proves no kth cut can add more than k regions. An arrangement with distinct interior intersections attains that number for every cut. Summing these attainable upper bounds and including the original region proves the formula gives the maximum.

## Complexity

O(1) time and space per input. Use 64-bit integer arithmetic for the product N(N + 1), not just for the final answer.

## Common mistakes

- Answering zero for zero cuts.
- Using 2ᴺ or forcing every cut through the center.
- Multiplying two 32-bit operands before assigning to a 64-bit result.
- Iterating once per cut despite the very large bound.
- Stopping only at −1 instead of any negative value.
