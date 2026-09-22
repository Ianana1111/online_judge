# Sweep grouped boundary events while tracking the maximum active height

## Problem and constraints

Each building is described by left coordinate `L`, height `H`, and right coordinate `R`, covering the half-open interval `[L,R)`. Up to 5000 buildings are read until EOF. Output only coordinates where the visible maximum height changes, including the final return to zero.

## Building the approach

The skyline can change only at a building boundary. Create an insertion event for height `H` at `L` and a removal event at `R`. Sweep event coordinates from left to right while a multiset stores one copy of every active building height. Its maximum is the current skyline. Keep a permanent zero representing the ground.

Process all events at the same coordinate before observing the maximum. If one building ends exactly when an equal-height building begins, the visible height never changes; emitting after individual events would create a false down-and-up pair at the same `x`.

Whenever the maximum after the group differs from the previous maximum, output the coordinate and new height.

## Walkthrough

Buildings `(1,10,5)` and `(3,10,7)` produce `1 10 7 0`. Starting the second building at three does not change the maximum. At five, removing the first copy of height ten still leaves the second, so the skyline remains. Only at seven does it return to zero.

If a taller building `(5,20,6)` is added, the skyline rises to 20 at five and falls back to 10 at six.

## Why it works

After all events at coordinate `x` are processed, the multiset contains exactly one height for every building satisfying `L<=x<R`: left events have inserted all starting buildings and right events have removed all ending buildings. Therefore its maximum is the true skyline immediately to the right of `x`.

No building starts or ends between consecutive event coordinates, so the height remains constant there. Recording exactly those grouped coordinates where the maximum changes outputs every necessary critical point and no spurious one.

## Complexity

Each building creates two events and each multiset update costs `O(log N)`, for `O(N log N)` time. Events and active heights use `O(N)` space.

## Common mistakes

- Using a set and losing duplicate building heights.
- Calling `multiset.erase(height)`, which removes every equal copy.
- Emitting after each individual event at a shared coordinate.
- Treating the right endpoint as covered and extending a building too far.
- Forgetting the final transition to height zero.
