Python integers work as arbitrary-length bitsets. Bit `sum` of `possible[count]` records whether exactly `count` people can weigh `sum`. For weight `w`, OR in `possible[count-1] << w`. Traverse `count` downward to avoid selecting the same person twice.

Choose exactly `n//2` people; the complement is the other team. Scan every reachable weight in that row and minimize its difference from the complement. With an odd number of people, the smaller-by-headcount team may be heavier, so do not stop at half the total.
