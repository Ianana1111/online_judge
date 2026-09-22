# Approach the exact root from above with integer Newton steps

## Problem and constraints

Given a positive perfect square Y with 1 ≤ Y ≤ 10¹⁰⁰⁰, print its exact integer square root. Inputs have no leading zeros. The upper endpoint itself has 1,001 decimal digits and is valid. Separate answers with a blank line. The perfect-square guarantee is part of the problem; zero and nonsquares are outside its input domain.

## Building the approach

Floating-point square root cannot preserve hundreds of exact digits. Use arbitrary-precision integers and Newton's update, keeping every division integral: `next = (root + Y // root) // 2`.

The stopping rule depends on the starting side. Choose an upper bound on the true root, then keep replacing it only while the update decreases it. When it stops decreasing, the exact root has been reached. Starting below the root would make that reasoning invalid.

If B is Y's bit length, then Y < 2ᴮ. Therefore `2^ceil(B/2)` is a valid initial upper bound. It is also close enough for Newton iteration to converge quickly, instead of searching through an enormous decimal range one candidate at a time.

## Walkthrough

For Y = 81, B = 7, so start at 16. The next value is `(16 + 81//16)//2 = 10`, then `(10 + 8)//2 = 9`. Another update stays at nine, so return nine. For Y = 1, the initial two decreases to one. At the upper endpoint, the output is 10⁵⁰⁰: a one followed by 500 zeros, not scientific notation.

## Why it works

Let the true integer root be t and the current value r ≥ t. Since `(r−t)² ≥ 0`, we have `t²/r ≥ 2t−r`; the right side is an integer, so flooring the quotient preserves that lower bound. The update therefore remains at least t. If r > t, then `t²/r < r`, making the integer average strictly less than r. Thus the sequence decreases while remaining above the root and stops exactly at t.

## Complexity

For B input bits, Newton iteration takes O(log B) rounds, each dominated by big-integer division. Writing its cost as D(B), the total is O(D(B) log B), with O(B) bits of arithmetic state. Stored input and output add space proportional to their text lengths.

## Common mistakes

- Converting the value to floating point.
- Starting below the root while using the above-root stopping rule.
- Performing only one Newton update.
- Rejecting the 1,001-digit upper endpoint.
- Omitting blank lines between answers.
