The initial table for denomination one has minimum count equal to each value zero through H. DFS parameters fully describe chosen count, last denomination, coverage, and current table.

Each candidate is greater than `last` and at most `coverage+1`. Upward updates permit repeated copies; coverage extends only while required count is at most H. Leaf depth K updates `best`, while the repeated upper bound safely prunes. Cache keys contain both H and K, and new uncached searches reset global best and initial state.
