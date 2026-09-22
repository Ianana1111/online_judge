# Add the mandatory full turns and three directed dial distances

## Problem and constraints

A lock dial has positions 0 through 39. Starting at a given position, turn clockwise through two full revolutions and stop at the first code, counterclockwise through one full revolution and stop at the second, then clockwise to the third. Print the total angle turned. Four zeroes terminate input; an individual zero is a normal dial value.

## Building the approach

Separate the mandatory revolutions from the extra movement to each stop. Two clockwise turns plus one counterclockwise turn always contribute `3*40=120` ticks.

Dial values decrease clockwise and increase counterclockwise. For start `s` and codes `a,b,c`, the additional distances are

- clockwise `s` to `a`: `(s-a+40)%40`;
- counterclockwise `a` to `b`: `(b-a+40)%40`;
- clockwise `b` to `c`: `(b-c+40)%40`.

Adding 40 before `% 40` keeps every C++ remainder nonnegative. Each tick is `360/40=9` degrees, so multiply the total ticks by nine.

## Walkthrough

For start zero and code `30 0 30`, each directed partial segment is ten ticks. Total movement is `120+10+10+10=150` ticks, or 1350 degrees.

If the start already equals the first code, the first extra distance is zero, but the required two full clockwise turns still remain. No extra revolution should be invented for equality either.

## Why it works

On a 40-position circle, the directed modular difference is the unique distance from one position to another in the specified direction using fewer than one full revolution. The three formulas use the correct clockwise, counterclockwise, and clockwise orientations, so they give all extra partial movement.

The statement independently requires exactly three complete turns, totaling 120 ticks. Summing those ticks and the three partial distances accounts for every movement in sequence. Multiplying by nine converts the exact total to degrees.

## Complexity

Each case uses `O(1)` integer time and `O(1)` space.

## Common mistakes

- Reversing the dial's clockwise and counterclockwise value directions.
- Computing shortest undirected distances and omitting mandatory full turns.
- Applying `%` to a negative difference without normalization.
- Calculating net rotation and canceling movement in opposite directions.
- Treating any individual zero as the terminator.
