`bit` is the current binary weight, while `bit-1` has every lower position set. At the start of an iteration, `mask` contains only decided higher bits, so these expressions model the minimum or maximum suffix without contamination from undecided choices.

The first branch sets a bit that improves the OR when the resulting minimum prefix stays below `upper`. The second branch sets an OR-neutral bit only when a zero could no longer reach `lower`. The bit index is signed so decrementing past zero ends normally; all values and shifts use the wider unsigned type.
