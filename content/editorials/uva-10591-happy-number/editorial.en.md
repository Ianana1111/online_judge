# Follow the digit-square sequence until reaching one or a repeated state

## Problem and constraints

Repeatedly replace a positive integer by the sum of the squares of its decimal digits. It is happy if this sequence reaches one and unhappy otherwise. Each input satisfies `1 <= N < 10^9`. Preserve the original number for the exact required case sentence.

## Building the approach

The transition is deterministic: the same current value always produces the same next value. Therefore, before reaching one, seeing any value a second time proves that all future values will repeat the same cycle.

For each test, maintain a set `seen`. While the current value is neither one nor already present, insert it and compute the next digit-square sum. When the loop ends, classify it as happy exactly when the current value is one.

Termination is guaranteed. The input has at most nine digits, so after one step the value is at most `9*9^2=729`; the subsequent deterministic sequence moves within a finite state set and must reach one or repeat.

## Walkthrough

For seven, the sequence is `7 -> 49 -> 97 -> 130 -> 10 -> 1`, so it is happy.

For four, the sequence reaches `4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4`. Returning to four proves an endless cycle without one. If the input itself is one, the loop performs no step and correctly reports happy.

## Why it works

At every iteration, `value` is obtained from the original input by exactly the stated transformation, and `seen` contains precisely the earlier processed states. Extracting digits with `% 10`, squaring, and summing computes the required next state.

Stopping at one directly proves a path to one. Stopping at a repeated value means deterministic transitions will repeat the same cycle forever; since one was not encountered earlier, it cannot occur later. These two cases exhaust every finite deterministic sequence, so the classification is correct.

## Complexity

If `K` distinct states are visited and values have at most `D` digits, time is `O(K(D+log K))` with the ordered set and space is `O(K)`. Here the states become very small after one step.

## Common mistakes

- Adding digits without squaring them.
- Using an arbitrary fixed iteration limit.
- Omitting cycle detection and looping forever on unhappy numbers.
- Sharing the visited set between test cases.
- Printing the transformed value instead of the original input.
