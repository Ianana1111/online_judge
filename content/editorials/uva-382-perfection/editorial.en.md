# Sum proper divisors in pairs up to the square root

## Problem and constraints

The positive proper divisors of `n` are its positive divisors excluding `n` itself. Classify `n` as `PERFECT` when their sum equals `n`, `ABUNDANT` when it is larger, or `DEFICIENT` when it is smaller. Inputs are positive integers up to 60000 ending with zero. Output has one global header and footer, and each number is right-aligned in width five followed by exactly two spaces.

## Building the approach

For `n > 1`, divisor 1 is always proper, so begin the sum at one. Every remaining divisor `d` is paired with `n / d`. At least one member of each pair is at most `sqrt(n)`, so enumerate `d` from 2 while `d*d <= n`. When `d` divides `n`, add both members, except when they are equal at a perfect square, where the square root must be added once.

The value 1 is the special case: it has no positive proper divisors, so its sum starts at zero. After computing the exact sum, one comparison selects the three mutually exclusive classifications.

## Walkthrough

For 28, the proper divisors are 1, 2, 4, 7, and 14, summing to 28, so it is perfect. For 12 they sum to 16, making it abundant. For 9, the pair at divisor 3 is `(3,3)` and contributes only one 3; together with 1 the sum is 4, so 9 is deficient.

## Why it works

Every divisor pair satisfies `d * (n/d) = n`. Counting 1 separately and omitting its partner `n` excludes the number itself. For every other pair, the loop reaches its smaller member no later than `sqrt(n)` and adds both members. Distinct pairs cannot overlap, and the equality check prevents double-counting a square root. The computed total is therefore exactly the proper-divisor sum, so comparing it with `n` gives the definition's classification.

## Complexity

Each number takes `O(sqrt(n))` time and `O(1)` extra space. The sums for the stated limit fit in an `int`.

## Common mistakes

- Including `n` itself in the proper-divisor sum.
- Adding a perfect square's root twice.
- Initializing the sum for `n = 1` to one.
- Printing one separator space instead of two after the width-five number.
- Repeating the global header and footer for every input.
