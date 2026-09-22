# Add the reversal before checking for a palindrome

## Problem and constraints

Repeatedly reverse the decimal digits of the current number and add that reversal to the number. Stop when the result after an addition is a palindrome, then print the number of additions and the palindrome. Up to 100 cases are given. A solution is guaranteed in fewer than 1,000 additions and the final value is at most 4,294,967,295. At least one addition is required even if the input is already palindromic.

## Building the approach

To reverse an integer, repeatedly take its last digit, append it to a result by multiplying that result by ten, and remove the digit by dividing the input by ten. Trailing zeros in the original naturally become omitted leading zeros in the numeric reversal.

For every iteration, assign `value += reverse(value)`, increment the count, and only then compare the new value with its reversal. A do-while loop directly encodes the mandatory first addition.

Use an unsigned 64-bit type because valid outputs can exceed signed 32-bit range. The problem guarantee supplies termination; imposing a smaller arbitrary iteration limit would reject legal cases.

## Walkthrough

Starting from 195 gives 786, 1473, 5214, then 9339. The fourth result is palindromic, so output `4 9339`.

Starting from 11 still performs `11+11=22` and outputs `1 22`. Starting from 10 reverses to 1 and reaches 11 in one addition, demonstrating numeric handling of zeros.

## Why it works

The reversal routine removes original digits from least to most significant and appends them in that same order to the new number, producing exactly the decimal reverse.

Each loop iteration performs one required operation and increments once. It stops exactly when the newly produced value is a palindrome. Every earlier produced value was tested and failed, so the reported count is the earliest positive iteration and the printed value is correct.

## Complexity

For `K` additions and at most `D` digits, time is `O(KD)` and extra space is `O(1)`.

## Common mistakes

- Checking the input first and returning zero additions.
- Storing the possible result in signed 32-bit `int`.
- Reusing an uncleared reversal accumulator.
- Counting a palindrome check as an extra addition.
