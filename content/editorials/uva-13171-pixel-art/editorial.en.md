# Encode every pixel color as three primary-paint requirement bits

## Problem and constraints

Pixels use magenta M, yellow Y, and cyan C. Red consumes M+Y, green Y+C, violet M+C, black all three, and white none. For an image of up to 100,000 pixels, decide whether the given M,Y,C stocks suffice and, if so, print the three exact remainders.

## Building the approach

Assign one bit to each primary paint. Map each of the eight colors to the mask of primaries it consumes. For every pixel, inspect the three bits and subtract one from each required stock.

After processing the picture, any negative remainder means failure. Zero is allowed, so otherwise print success and the remaining values in M,Y,C order.

## Walkthrough

With stocks `1,1,1`, pixels M,C,Y use everything exactly and produce `YES 0 0 0`. Pixels R,V require two units of M and fail with the same stock. Any number of white pixels consumes nothing because their mask is zero.

## Why it works

The mask table exactly lists each color's primary composition. The loop subtracts once for every required channel and never for an unused one, so final stocks equal initial stocks minus true total demand. Since demand only consumes paint, all remainders are nonnegative exactly when the complete image can be painted, and those values are the correct leftovers.

## Complexity

Each pixel checks three fixed channels, for `O(L)` time and `O(1)` algorithmic state. Python integers preserve exact stock values.

## Common mistakes

- Treating black as one paint instead of all three.
- Omitting cyan from green or confusing cyan with blue.
- Charging paint for white.
- Rejecting stock that reaches exactly zero.
- Printing remainders in an order other than M,Y,C.
