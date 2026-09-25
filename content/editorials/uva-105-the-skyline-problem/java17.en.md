The skyline can change only at a building boundary. Create an insertion event for height `H` at `L` and a removal event at `R`. Sweep event coordinates from left to right while a multiset stores one copy of every active building height. Its maximum is the current skyline. Keep a permanent zero representing the ground.

Process all events at the same coordinate before observing the maximum. If one building ends exactly when an equal-height building begins, the visible height never changes; emitting after individual events would create a false down-and-up pair at the same `x`.

Whenever the maximum after the group differs from the previous maximum, output the coordinate and new height.

Treat a building’s left edge as adding its height and its right edge as removing it. Apply all events at one coordinate before comparing the current maximum with the previous height; print a key point only when the height changes.
