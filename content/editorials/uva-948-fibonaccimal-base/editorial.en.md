# Take the largest available Fibonacci number to build the unique representation

## Problem and constraints

Represent each positive integer as a sum of distinct Fibonacci weights. The weights are `1, 2, 3, 5, ...`, the representation may have neither a leading zero nor adjacent ones, and the input value is below `100,000,000`. There are at most 500 test cases.

## Building the approach

It helps to stop thinking of the answer as an unfamiliar numeral system. We only need to decide which Fibonacci numbers belong to the sum. Take the largest weight that does not exceed the remaining value, subtract it, and continue toward smaller weights.

Why does this also enforce the no-adjacent-ones rule? If the chosen weight is `F[i]`, then the old remainder was smaller than `F[i+1] = F[i] + F[i-1]`. After subtracting `F[i]`, the new remainder is therefore smaller than `F[i-1]`, so the adjacent lower weight cannot be selected. Greedy choice and the required format fit each other exactly.

Generate the weights starting with `1, 2`, scan them from largest to smallest, and append `1` when a weight is selected. Once the first `1` has been written, append `0` for every skipped weight so that the positions remain correct.

## Walkthrough

For `17`, the largest usable weight is `13`, leaving `4`. We skip `8` and `5`, take `3`, skip `2`, and take `1`. The bits from weight `13` down to `1` are `100101`, so the required line is `17 = 100101 (fib)`.

## Why it works

Whenever the algorithm selects `F[i]`, the remaining value becomes smaller than `F[i-1]`; hence the next bit must be zero and adjacent ones never occur. The process eventually reaches weight `1`, so it represents the entire input.

The representation is also forced. Without `F[i]`, the largest sum obtainable from smaller nonadjacent weights is `F[i] - 1`. Thus any remaining value at least `F[i]` must use `F[i]`. Applying the same argument after every subtraction proves that every greedy decision, and therefore the complete representation, is unique.

## Complexity

There are `O(log V)` Fibonacci weights for a value `V`. Precomputation and each conversion take `O(log V)` time and `O(log V)` space including the output string.

## Common mistakes

- Starting the weights with `1, 1` and duplicating the lowest position.
- Treating the value as ordinary binary.
- Building from small weights and producing adjacent ones.
- Printing leading zeroes before the first selected weight.
- Printing the exhausted remainder instead of the original decimal value.
