Maintain the smaller half in a max-heap `lower` and the larger half in a min-heap `upper`. Enforce two invariants: every lower value is no greater than every upper value, and lower has either the same size as upper or one extra element.

Insert a new value into lower when it is no larger than lower's maximum; otherwise insert into upper. If sizes become invalid, move the boundary element from the larger side to the other heap.

With odd count, lower has one extra and its maximum is the median. With even count, the two heap tops are the middle pair. Add them in 64-bit arithmetic before dividing by two so two legal 32-bit values cannot overflow.

Keep the lower half in a max-heap and the upper half in a min-heap. Rebalance with boundary values, and add the two middle values using 64-bit arithmetic.
