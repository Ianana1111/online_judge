Each `PairSum` stores a sum and the two indices in the sorted value array. Generating only `i < j` excludes self-pairs and avoids storing both orders of the same pair.

The outer d loop decreases through sorted values; c ranges over every other index. `lower_bound` locates the first pair with the target sum. The following loop checks all equal-sum candidates until it finds one whose indices avoid both c and d. Distinct input values imply at most two such pairs can be rejected for overlap.

`found` is separate from `answer`, so a legitimate negative or zero answer is not confused with failure. Both loops stop as soon as a valid pair is found for the current d, which is already the largest remaining candidate.
