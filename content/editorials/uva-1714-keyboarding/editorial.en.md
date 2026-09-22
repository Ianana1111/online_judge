# Keep cursor cells and run a multi-source shortest path for each key

## Problem and constraints

On a keyboard up to 50 by 50, one arrow press skips the entire contiguous run of the current key in that direction and stops at the first different key, or does nothing at the edge. Starting top-left, type up to 10,000 characters and finally select `*` as Enter. Minimize four arrow presses plus selection presses.

## Building the approach

Treat every cell as a graph vertex and precompute each effective directional jump with unit cost. Do not merge cells of one large key, because different landing cells have different future jumps.

Let `cost[cell]` be minimum arrows after typing the current prefix. For the next target, run Dijkstra initialized with every finite cell at its own cost, then retain distances only at cells containing the target. Append Enter as a final target. Consecutive equal targets may be compressed for navigation, while selection count remains original text length plus one.

## Walkthrough

On row `AAA*`, typing A starts with a selection at no movement cost. One right arrow skips the rest of A to `*`, then Enter is selected, totaling three presses. Ten thousand A characters still need only that one navigation move to Enter.

## Why it works

Every graph edge represents exactly one effective arrow press. From all optimal current landings, multi-source shortest paths give the least navigation cost to every next-key cell; selecting does not move the cursor, so filtering establishes the next state invariant. Induction through text and Enter yields optimal arrows, and adding the fixed number of selections gives total presses. Equal consecutive selections can be performed before moving without changing any path.

## Complexity

With `V=RC` and L compressed targets, preprocessing is `O(V(R+C))` and searches `O(LV log V)`, using `O(V)` rolling space.

## Common mistakes

- Moving only one grid cell per arrow.
- Merging all cells of a key.
- Forgetting Enter navigation or selection.
- Giving all multi-source starts cost zero.
- Removing selection counts when compressing repeated letters.
