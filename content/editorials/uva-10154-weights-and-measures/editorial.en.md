# Add turtles by increasing strength and drop the heaviest one whenever the stack is overloaded

## Problem and constraints

There are at most 5607 turtles, each with a weight and a strength (integers from 1 to 200000), read until end of file. Strength includes the turtle's own weight: a turtle plus everything on its back must not exceed its strength. Find the largest number of turtles that can be stacked.

## Building the approach

First decide how a stack should be ordered. If two adjacent turtles have the stronger one on top, swapping them never hurts: the total weight on the lower position is unchanged, and the stronger turtle moves down to carry it. So some optimal stack has strength increasing from top to bottom. Therefore we can consider turtles in increasing order of strength, and every newly added turtle goes to the bottom of the current stack.

Next decide which turtles to keep. Processing by increasing strength, add each new turtle at the bottom and add its weight to the total. If the total exceeds its strength, the stack is no longer valid and one turtle must leave. Removing the heaviest turtle currently in the stack is best: the count drops by one either way, but the remaining total is as light as possible, which helps every turtle added later. A max-heap of the chosen weights finds the heaviest turtle quickly.

This is the Moore–Hodgson algorithm from scheduling, with strength as the deadline and weight as the processing time. A DP also works: dp[k] is the smallest total weight of a valid k-turtle stack, updated turtle by turtle in strength order, which is O(n²) and still fine for n = 5607, but the greedy with a heap is O(n log n).

## Walkthrough

The four turtles (weight, strength) are (300, 1000), (1000, 1200), (200, 600) and (100, 101). Sorted by strength: (100, 101), (200, 600), (300, 1000), (1000, 1200).

Add (100, 101): total 100 ≤ 101. Add (200, 600): total 300 ≤ 600. Add (300, 1000): total 600 ≤ 1000. Add (1000, 1200): total 1600 > 1200, so remove the heaviest weight 1000 and the total returns to 600. Three turtles remain, so the answer is 3.

## Why it works

The algorithm keeps an invariant: after processing the first i turtles in strength order, the heap holds a valid stack with the maximum possible count using only those turtles, and among valid stacks of that count it has the smallest total weight. If adding turtle i + 1 keeps the stack valid, increasing the count is clearly best. If not, no valid stack can be larger than before, and removing the heaviest turtle keeps the same count with the smallest total. When the chosen turtles are stacked by strength, each one carries itself plus all weaker turtles above it, and the binding check is at the bottom turtle, which was just added and has the largest strength, so checking the newest turtle is enough.

## Complexity

Sorting takes O(n log n), and each turtle enters and leaves the heap at most once at O(log n) per operation, so the total time is O(n log n) and the space is O(n).

## Common mistakes

- Sorting by weight or by strength minus weight instead of by strength.
- Rejecting the new turtle on overload instead of dropping the heaviest one in the stack.
- Forgetting that strength includes the turtle's own weight and checking only the load on its back.
- Accumulating the total in a 32-bit integer, which can overflow on larger data.
- Counting a turtle whose weight exceeds its strength.
