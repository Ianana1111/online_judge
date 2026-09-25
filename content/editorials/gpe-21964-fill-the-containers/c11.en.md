The optimum is hard to construct directly, but a guessed capacity `C` creates a yes-or-no question. Process vessels in order, filling the current container until the next vessel would exceed `C`, then open a new container. This greedy packing uses the fewest containers for that capacity.

Capacity feasibility is monotone: if `C` works, every larger capacity works. Binary-search the first feasible value. The largest individual vessel is a lower bound because splitting is forbidden. The total milk is an upper bound because one container could hold everything.

During the check, equality fits exactly; a new container is needed only when `current+milk>C`. Feasibility means the used count is at most `M`, since extra containers need not be filled.

For a guessed capacity, greedily fill each container in order, minimizing container count. Feasibility grows monotonically with capacity, so binary-search between the largest vessel and total milk.
