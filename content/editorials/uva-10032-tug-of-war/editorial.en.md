# Balance both team size and total weight

## Problem and constraints

Split up to 100 people, each weighing 1 through 450, into two teams. Every person belongs to exactly one team, team sizes differ by at most one, and the weight difference is minimized. Print the lower team weight first. Ordinary equal-sum partition is insufficient because selected-person count is also constrained.

## Building the approach

Choose exactly `floor(n/2)` people for one team; everyone else forms the other. This represents every legal split, including odd-size cases.

Let `possible[count][sum]` state whether processed people can form a subset of exactly `count` members and weight `sum`. Initially only zero people and zero weight are possible. For weight `w`, update

`possible[count] |= possible[count-1] << w`.

A bitset stores every weight for one count and shifts all transitions together. Counts must update downward so the current person cannot feed a state that uses the same person again.

After all people, scan every reachable sum at the required count and minimize `|total-2*sum|`. Scan beyond half the total: with an odd number of people, the smaller-member team may be heavier.

## Walkthrough

For weights 100, 90, and 200, one team must have one person. Choosing 200 yields team totals 200 and 190, the best split. Restricting the selected one-person team to at most half the total would miss it and choose 100 versus 290.

With one person, the other team is empty and weight zero, which still satisfies a size difference of one.

## Why it works

Induct over people. Existing states represent excluding the current person; shifted prior-count states represent including that person. Descending count ensures a shifted source does not already contain the same person. Thus the table contains exactly every subset for each size.

Every legal partition has one team of size `floor(n/2)` and therefore appears in the scanned row; its complement determines the other weight. Comparing all such differences finds the global optimum, and sorting the two totals gives the required output order.

## Complexity

With maximum total weight `W=45000` and `K=floor(n/2)`, bitset transitions take about `O(nKW/b)` machine-word work and storage is `O(KW)` bits. Final scanning is `O(W)`.

## Common mistakes

- Tracking only weight and ignoring team size.
- Updating count upward and reusing one person.
- Searching only selected sums at most half the total.
- Ordering output by member count rather than weight.
- Reusing reachability state across cases.
