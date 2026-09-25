Sort ads by increasing end and let `best[i]` be maximum profit among the first `i` ads. For current ad, either skip it and keep `best[i-1]`, or choose it. In the chosen case, previous ads must end at or before its start. Binary-search the sorted end array with `upper_bound(start)` to obtain the number `compatible` of such earlier ads, then use `best[compatible]+profit`.

Ordinary earliest-finish greedy is insufficient because profits differ, and highest-profit-first can block several compatible ads with greater combined value.

Sort ads by finishing floor. For each ad, compare skipping it with taking its profit plus the best compatible prefix; binary search counts earlier ads ending no later than its starting floor.
