If the total is odd, equal division is impossible. For an even total, choosing one vehicle's items with sum `target=total/2` automatically leaves the other vehicle the same weight. The problem is therefore zero-one subset sum.

Let `reachable[s]` mean that processed items can form sum `s`. Initially only zero is reachable. For each weight `w`, update sums from `target` down to `w`:

`reachable[s] |= reachable[s-w]`.

Descending order is essential. The smaller source index has not yet been updated for this item, so the same suitcase cannot be reused in one iteration.

Odd total weight cannot be split; otherwise update subset sums downward so each bag is used at most once.
