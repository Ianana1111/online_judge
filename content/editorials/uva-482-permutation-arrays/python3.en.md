Read the entire permutation line and allocate an answer array of the same length. Then read the value tokens in their original order. For each destination `p[i]`, assign the corresponding token to `answer[p[i]-1]`. Finally print the answer array from its first position onward.

The permutation describes destinations, not source positions to fetch. Since the task only moves representations and performs no arithmetic, values must remain strings. Converting through floating point could turn `1.00` into `1` or rewrite scientific notation.

The first line maps input positions to destination indices; place each following value at `answer[index[i]−1]`.
