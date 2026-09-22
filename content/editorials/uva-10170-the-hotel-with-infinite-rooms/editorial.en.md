# Binary-search the first group whose checkout reaches the day

## Problem and constraints

The first group has S people and stays S days. The next has S+1 people and stays S+1 days, continuing without gaps. Given day D, determine the group size occupying the hotel then. Here `1<=S<=10000`, `1<=D<10^15`, and input continues to EOF. A group's checkout day still belongs to that group; the next group arrives the following morning.

## Building the approach

If the last included group has size k, total occupied days are

`S+(S+1)+...+k = (k-S+1)(S+k)/2`.

This function is strictly increasing in k. The answer is therefore the smallest k whose cumulative total is at least D.

Binary-search the inclusive interval from S through `10^8`. Even from the largest allowed S, that upper endpoint accumulates beyond `10^15`, so it covers every answer. Products stay below signed 64-bit range and can be compared exactly without floating roots.

## Walkthrough

With S=3, the three-person group occupies days 1-3, the four-person group days 4-7, and the five-person group days 8-12. Day 7 returns four; only day 8 advances to five.

This demonstrates why the predicate must use cumulative total greater than or equal to D rather than strictly greater.

## Why it works

Each group stays exactly its size in days and groups are consecutive, so the cumulative formula is exactly the checkout-day number for group k. Day D belongs to the unique k satisfying `through(k-1)<D<=through(k)`.

That k is precisely the first index where the monotone cumulative value reaches D. Lower-bound binary search discards only indices proven too early or keeps a qualifying midpoint as a possible first, so its convergence is correct.

## Complexity

Each case uses `O(log 10^8)` time, about 27 comparisons, and `O(1)` space.

## Common mistakes

- Using a strict comparison and moving checkout day to the next group.
- Summing from group one instead of S.
- Storing D or intermediate products in `int`.
- Simulating millions of groups.
- Using an uncorrected floating square root near a boundary.
