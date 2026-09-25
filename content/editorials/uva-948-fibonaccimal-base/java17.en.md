It helps to stop thinking of the answer as an unfamiliar numeral system. We only need to decide which Fibonacci numbers belong to the sum. Take the largest weight that does not exceed the remaining value, subtract it, and continue toward smaller weights.

Why does this also enforce the no-adjacent-ones rule? If the chosen weight is `F[i]`, then the old remainder was smaller than `F[i+1] = F[i] + F[i-1]`. After subtracting `F[i]`, the new remainder is therefore smaller than `F[i-1]`, so the adjacent lower weight cannot be selected. Greedy choice and the required format fit each other exactly.

Generate the weights starting with `1, 2`, scan them from largest to smallest, and append `1` when a weight is selected. Once the first `1` has been written, append `0` for every skipped weight so that the positions remain correct.

Visit Fibonacci weights from largest to smallest and take each affordable one; omit leading zeroes before the first one.
