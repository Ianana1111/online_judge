# Repeat digit sums until only one digit remains

## Problem and constraints

For each positive integer `n`, sum its decimal digits, then repeat the same operation on the result until one digit remains. Inputs are at most 2,000,000,000. A zero terminates the entire input and is not processed. This is an ordinary digit sum, not a sum of squared digits, and one round may be insufficient.

## Building the approach

Follow the definition with two nested loops. The outer loop runs while the current value has at least two digits. For one round, reset `sum` to zero, repeatedly add `value % 10`, and remove that digit with integer division by 10. When all digits have been consumed, assign the round's sum back to `value`.

An input already between 1 and 9 skips the outer loop and is its own answer. Direct simulation also avoids the special case needed by a modulo-nine formula, where positive multiples of nine must map to 9 rather than 0.

## Walkthrough

For `1234567892`, the first digit sum is 47. The next is `4+7=11`, and the third is `1+1=2`, so the output is 2. For 99, one round produces 18 and a second produces 9. Stopping after the first round would incorrectly print 18.

## Why it works

During one inner loop, each iteration extracts the current least significant decimal digit exactly once and then removes it. Therefore the accumulated value is precisely the sum of all digits from that round. Reassigning it performs one transformation from the definition.

Whenever a positive number has at least two digits, its digit sum is smaller than the number because higher-place digits lose place values of at least 10. The sequence therefore eventually reaches 1 through 9. Such a one-digit value is unchanged by another digit sum, so the value at termination is exactly the required result.

## Complexity

If the input has `D` digits, the total work is `O(D)` because later values shrink rapidly; equivalently it is `O(log n)`. The algorithm uses `O(1)` extra space.

## Common mistakes

- Performing only one digit-sum round.
- Forgetting to reset `sum` for each round.
- Printing `n % 9` directly and mapping positive multiples of nine to zero.
- Processing the terminating zero.
- Applying unnecessary special handling to one-digit inputs.
