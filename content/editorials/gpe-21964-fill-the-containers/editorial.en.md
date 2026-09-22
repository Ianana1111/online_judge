# Binary-search the smallest feasible container capacity

## Problem and constraints

`N` vessels of milk must be poured in order into at most `M` containers. A vessel cannot be split, and every used container receives one contiguous segment of the original sequence. Choose one common capacity and minimize it. `N<=1000`, each vessel holds at most one million, and `M` may exceed `N`; unused containers are allowed.

## Building the approach

The optimum is hard to construct directly, but a guessed capacity `C` creates a yes-or-no question. Process vessels in order, filling the current container until the next vessel would exceed `C`, then open a new container. This greedy packing uses the fewest containers for that capacity.

Capacity feasibility is monotone: if `C` works, every larger capacity works. Binary-search the first feasible value. The largest individual vessel is a lower bound because splitting is forbidden. The total milk is an upper bound because one container could hold everything.

During the check, equality fits exactly; a new container is needed only when `current+milk>C`. Feasibility means the used count is at most `M`, since extra containers need not be filled.

## Walkthrough

For vessels `4,78,9` and two containers, capacity 81 needs three groups because neither `4+78` nor `78+9` fits. Capacity 82 permits `[4,78]` and `[9]`, so 82 is feasible and optimal.

When `M>=N`, each vessel may occupy its own container, making the maximum single-vessel amount the answer.

## Why it works

For fixed `C`, greedy makes every container hold the longest possible prefix. No other valid first container can end later. Repeating this argument segment by segment shows that after any equal number of containers, greedy has processed at least as many vessels as any alternative. It therefore uses the minimum possible number of containers, so `used<=M` exactly characterizes feasibility.

The predicate changes only from false to true as capacity grows. Binary search preserves an interval containing the first true value: an infeasible midpoint removes itself and everything below it, while a feasible midpoint remains as a possible upper bound. At convergence, the retained value is the minimum capacity.

## Complexity

Each check takes `O(N)` time. Binary search gives `O(N log S)` total time for total milk `S`, with `O(N)` storage for vessel amounts.

## Common mistakes

- Sorting vessels and destroying their required order.
- Using the rounded-up average despite indivisible vessels.
- Opening a new container on equality.
- Requiring exactly `M` used containers.
- Starting below the largest vessel without handling immediate overflow.
