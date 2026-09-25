Fix the earliest accepted car at index `i`. Every later accepted car lies after it in input. Cars added to the front must form an increasing-weight chain beginning at `i`, while cars added to the rear form a decreasing-weight chain beginning at `i`.

Let `rise[i]` and `fall[i]` be their maximum lengths. Process indices right to left. For every `j>i`, a heavier `weight[j]` can extend `rise[j]`, while a lighter one can extend `fall[j]`. The two chains share only the fixed first car, so their combined length is `rise[i]+fall[i]-1`. Maximize this over all starts.

The implementation converts normalized decimal weight strings into order-preserving ranks, avoiding an unstated fixed-width assumption while retaining all comparisons.

Rank carriage weights numerically without overflowing large integer strings. Scan backward to find the longest increasing and decreasing chains from each starting car; add their lengths and subtract the shared starting car.
