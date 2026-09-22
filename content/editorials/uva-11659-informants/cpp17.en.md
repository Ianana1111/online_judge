Positive and negative claims use separate integer masks, with input labels converted to zero-based bits. Bitwise OR accumulates every claim and harmlessly deduplicates repeats.

Popcount gives the candidate size. Only set-bit speakers are checked. Positive containment compares the complete positive mask, while any negative intersection invalidates the assignment. Invalid masks do not affect later candidates, and only validated masks update the best.
