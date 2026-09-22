# Match a pair sum against a difference

## Problem and constraints

Given 1 to 1,000 distinct integers from −536,870,912 through 536,870,911, find the largest set element d for which `a + b + c = d`, using four distinct elements. Print `no solution` if none exists. Values and the answer may be negative. A zero set size ends input.

## Building the approach

Four nested loops are too expensive. Rewrite the equation as `a + b = d − c`, splitting the work into two pairs. Precompute every unordered pair of distinct indices, storing its sum and both indices, then sort these records by sum.

Sort the original values too, and try d from largest to smallest. For each c distinct from d, binary-search pair sums equal to `d − c`. The stored indices must also avoid c and d; arithmetic equality alone does not guarantee four distinct elements.

Do not keep just one pair per sum. That representative might overlap c or d while another pair is valid. Keeping all pairs does not make equal-sum scanning quadratic here: because input values are distinct, an element has only one possible complement for a fixed sum. Equal-sum pairs therefore share no indices. The two forbidden indices can invalidate at most two pairs; a third one, if present, is usable.

## Walkthrough

For `{2,3,5,7,12}`, the relation `2 + 3 + 7 = 12` gives the largest possible d, namely 12. With only `{1,2,3}`, reusing 1 three times is forbidden and there are not even four distinct elements, so no solution exists. A negative valid d must still be returned if it is the largest feasible value.

## Why it works

The pair table contains every possible distinct a,b choice. For fixed d,c, the search finds exactly pairs satisfying the equation, and index checks enforce all remaining distinctness requirements. Every accepted result is therefore legal, and any legal quadruple is found in its corresponding d,c search. Descending d order makes the first successful value the maximum.

## Complexity

Building and sorting O(N²) pair records takes O(N² log N) time. There are O(N²) binary searches, each followed by at most three relevant pair checks, preserving that time bound. Space is O(N²). Use 64-bit sums and differences.

## Common mistakes

- Reusing an element in multiple roles.
- Retaining only one pair for each sum.
- Returning the first found d without descending value order.
- Using zero as a valid default answer and rejecting negative solutions.
- Enumerating four indices directly.
