# Open doors are perfect squares

## Problem and constraints

Person `k` toggles every door whose number is a multiple of `k`. After all `N` people have acted, we need the largest-numbered open door. The value of `N` may have 101 decimal digits (`N <= 10^100`), and a zero line terminates the input. We cannot simulate the people or store all doors, and the requested output is the door number rather than the number of open doors.

## Building the approach

Consider one door `d`. It is toggled once for every divisor of `d`. Divisors normally occur in pairs, such as `2` and `d/2`. A pair contributes two toggles and does not change the final parity. The only time a divisor is unpaired is when it equals its partner, which means `d` is a perfect square. Thus exactly the square-numbered doors remain open.

The answer is consequently the largest square not exceeding `N`: `floor(sqrt(N))^2`.

Floating-point square roots are unsafe around square boundaries for a 100-digit integer. The implementation uses integer Newton iteration. Starting from a power of two above the root, repeatedly compute `next = floor((current + floor(N/current))/2)` until it no longer decreases. Every operation remains exact integer arithmetic.

## Walkthrough

For `N=90`, the open doors are `1,4,9,...,81`, so the answer is `81`. For `N=100`, door `100` is itself open. For `N=99`, the answer must return to `81`.

The boundary is especially important for huge values. If `N=k^2-1`, the result is `(k-1)^2`; if `N=k^2`, it is exactly `k^2`. Integer iteration distinguishes these cases without rounding.

## Why it works

A door finishes open exactly when it is toggled an odd number of times. Since the togglers of door `d` are precisely its divisors, divisor pairing proves that this happens exactly for perfect squares.

Let `r=floor(sqrt(N))`. The initial Newton estimate is at least `r`. While `current>r`, we have `N<current^2`, so `N/current<current` and the next estimate decreases. The integer average never drops below `r`; once `current=r`, the next value cannot be smaller and the loop returns. Therefore the computed root is exactly `r`, and squaring it gives the largest open door.

## Complexity

For a `B`-bit number, Newton iteration takes `O(log B)` big-integer iterations. If `D(B)` is the cost of a `B`-bit division, the time is `O(D(B) log B)` and the working space is `O(B)`.

## Common mistakes

- Storing `N` in a fixed-width integer.
- Using a floating-point square root near a huge perfect-square boundary.
- Printing the root instead of squaring it back into a door number.
- Attempting to toggle all doors explicitly.
- Processing the terminating zero as a normal case.
