# Maintain each prefix median with two heaps

## Problem and constraints

Integers arrive one at a time. After every new value, print the median of all values seen so far. There are fewer than 10,000 values and each lies from zero through `2^31-1`; input ends at EOF. Odd prefixes use the single middle value, while even prefixes use the integer part of the average of the two middle values. Zero is data, not a terminator.

## Building the approach

Maintain the smaller half in a max-heap `lower` and the larger half in a min-heap `upper`. Enforce two invariants: every lower value is no greater than every upper value, and lower has either the same size as upper or one extra element.

Insert a new value into lower when it is no larger than lower's maximum; otherwise insert into upper. If sizes become invalid, move the boundary element from the larger side to the other heap.

With odd count, lower has one extra and its maximum is the median. With even count, the two heap tops are the middle pair. Add them in 64-bit arithmetic before dividing by two so two legal 32-bit values cannot overflow.

## Walkthrough

For stream `1,3,4,60`, reported medians are 1, 2, 3, and 3. The final sorted middle pair is 3 and 4, whose average 3.5 is truncated to 3.

Two zeros both produce zero. Two values equal to 2,147,483,647 also have that median, but their sum exceeds signed 32-bit range.

## Why it works

Comparison with lower's maximum places the new value on the correct side of the partition. Rebalancing moves only a boundary value, so lower remains entirely no greater than upper while the size invariant is restored.

For odd size, equal counts lie on either side of lower's maximum, making it the middle. For even size, the maximum lower and minimum upper are exactly the two central sorted values. The reported formulas therefore match the median definition after every insertion.

## Complexity

Each insertion and possible move costs `O(log N)`, for `O(N log N)` total time and `O(N)` heap storage. Median lookup itself is `O(1)`.

## Common mistakes

- Making both heaps max-heaps.
- Letting upper hold the extra element but reading lower for odd prefixes.
- Dividing both middle values before adding.
- Adding in 32-bit storage.
- Treating zero as EOF.
