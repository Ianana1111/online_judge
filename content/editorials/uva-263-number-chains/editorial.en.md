# Sort the current natural-width digits until a value repeats

## Problem and constraints

For each positive number below one billion, sort its current decimal digits descending and ascending, subtract the latter from the former, and repeat until a generated number already appeared. Print every subtraction, chain length, and a blank line. Zero terminates input. Later values use their natural decimal width without restored leading zeroes.

## Building the approach

Insert the original value into a seen set. At each step, convert current to its ordinary decimal string, sort ascending for low, reverse for high, compute next, increment length, and print the equation. Only after printing, stop if next is already seen; otherwise insert it and continue.

Starting with the original makes fixed points stop after one subtraction. Counting one per subtraction equals the number of distinct processed current values, including the initial one.

## Walkthrough

For 1000, the first step is `1000-1=999`. The next value uses three digits, producing zero, followed by `0-0=0`; chain length is three. Padding 999 back to 0999 would create the wrong trajectory. For 444, the chain length is two.

## Why it works

Sorting gives the maximum and minimum integers constructible from exactly the current digits, so every transition matches the definition. Before a step, seen contains all distinct values through current. A new result extends the invariant; an old result is exactly the stopping condition. Printing before the check preserves the required repeated-result equation, and each processed current is unique, proving the length.

## Complexity

For C chain states and at most nine digits, time is `O(C(D log D+log C))` and storage `O(C)`.

## Common mistakes

- Omitting the original from seen.
- Stopping before printing the repeated-result step.
- Padding later values to original width.
- Treating an internally generated zero as input termination.
- Printing leading zeroes in sorted integers.
