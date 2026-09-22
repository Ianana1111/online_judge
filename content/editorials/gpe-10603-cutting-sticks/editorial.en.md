# Choose the first cut, then solve the two pieces independently

## Problem and constraints

A stick of length L must be cut at N specified internal positions. A cut costs the length of the piece being cut at that moment. Minimize the total cost. Here L < 1,000, N < 50, and cut positions are strictly increasing. L = 0 ends input. With no required cuts, the answer is zero.

## Building the approach

The same final pieces can have different costs depending on cut order. Cutting from left to right repeatedly charges for a large remaining piece. A greedy midpoint choice sounds plausible, but does not account for all later cuts.

Instead, ask which cut happens first within a particular segment. That cut costs the entire segment length. Afterward its left and right pieces are independent: cutting one cannot change the other's costs. This is the structure needed for interval dynamic programming.

Add 0 and L to the cut-position array. Let `dp[left][right]` be the minimum cost of completing all required cuts strictly between those two boundaries. Adjacent boundaries contain no required cut, so their cost is zero. For a larger interval, try every first cut k and minimize `cut[right] − cut[left] + dp[left][k] + dp[k][right]`. Fill shorter intervals before longer ones.

## Walkthrough

For length 10 and cuts at 2, 4, and 7, cutting in that order costs 10 + 8 + 6 = 24. Cut at 4 first instead: the remaining pieces have lengths four and six, each needing one cut. The total is 10 + 4 + 6 = 20. The DP compares this choice with every other possible first cut.

## Why it works

Every nonempty cutting plan has a first cut. Once it is made, replacing either side's later work with a cheaper plan would improve the whole plan without affecting the other side. An optimal plan therefore uses optimal subplans. Enumerating every first cut includes the optimal choice, and taking the minimum gives the interval optimum. The empty-interval base and increasing interval lengths complete the induction.

## Complexity

O(N²) intervals each try O(N) first cuts, giving O(N³) time and O(N²) space. The total is less than 49,000 under the given bounds, so an integer is sufficient.

## Common mistakes

- Charging only for a smaller resulting piece.
- Following the input cut order.
- Assuming a midpoint greedy choice is always optimal.
- Forgetting the two outer boundaries.
- Evaluating an interval before its subintervals.
