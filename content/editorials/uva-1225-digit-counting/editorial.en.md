# Extract every written digit directly within the small bound

## Problem and constraints

Write the positive integers from 1 through `N` without leading zeroes and count how often each digit 0 through 9 occurs. Here `1<N<10000` and there are at most 20 cases. Repeated occurrences within one number count separately.

## Building the approach

The bound is small enough to enumerate every integer. For each `value` from 1 through `N`, copy it to `x`. The remainder `x%10` is its current last digit; increment that digit's counter, then remove it with `x/=10`. Continue until no digits remain.

This procedure sees real internal and trailing zeroes, such as both zeroes in 100, but never invents leading zeroes. Starting from one also avoids counting the standalone number zero, which is not written in the requested sequence.

## Walkthrough

For `N=13`, the number 10 supplies one zero. The digit one occurs in `1,10,11,12,13`, with the two positions in 11 counted separately, for six total occurrences. Digits two and three each occur twice, and digits four through nine once each.

## Why it works

The outer loop visits exactly the integers named by the problem. For any positive integer, repeated remainder and division by ten exposes each digit in its standard decimal representation exactly once and exposes no other positions. Incrementing the corresponding counter therefore counts every written occurrence once, including repeated and zero digits, with no leading-zero additions.

## Complexity

The algorithm takes `O(N log N)` digit operations and `O(1)` extra space for ten counters. Under the given bound, each number has at most four digits.

## Common mistakes

- Starting at zero and adding an unwanted zero occurrence.
- Excluding `N` from the outer loop.
- Counting each distinct digit only once per number.
- Padding numbers to four digits and counting leading zeroes.
- Failing to clear counters between cases.
