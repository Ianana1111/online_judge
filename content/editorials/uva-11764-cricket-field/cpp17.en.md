Reading the first height separately lets the loop start at index 1 and process only real adjacent moves. Both counters begin at zero for each case.

Strict comparisons leave equal walls uncounted. `previous=current` runs after every comparison regardless of direction. A one-wall case skips the loop and prints the initial zeros in the required high-then-low case format.
