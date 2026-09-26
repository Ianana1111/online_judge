Choosing overnight stops directly creates many possible partitions. Instead, guess a maximum daily distance limit and ask whether it is feasible. Feasibility is monotone: a feasible limit remains feasible when increased, enabling binary search.

For a fixed limit, walk as far as possible each day, starting a new day only if adding the next segment would exceed it. This greedy choice uses the fewest days: going farther on the first day leaves no more work for later days, and the same argument repeats. Equality is allowed; split only on a strict excess.

nights overnights allow nights+1 days. Extra overnights may stay at an existing camp with zero walking, so requiring minimum days≤nights+1 is sufficient. Do not insist on that many nonempty segments.

The longest segment is a lower bound and the total distance is an upper bound. If the midpoint is feasible, lower the upper bound; otherwise set the lower bound to midpoint+1. All distances are nonnegative, supporting the greedy argument and bounds.

Distances have no stated magnitude limit. C/C++ use decimal-string addition, comparison, and halving; Java uses BigInteger. With total distance S and n+1 segments, perform O(n log(S+1)) arbitrary-precision additions/comparisons, each with its digit cost. Store the segment distances and a constant number of search values.
