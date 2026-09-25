Store every seen complete vector in a set. At each iteration, check all-zero first. Otherwise insert the vector; a failed insertion proves repetition and therefore a loop.

Compute the next vector separately from the unchanged old state. In-place updates would make later differences mix current and previous rounds. Use `(i+1)%n` for circular wraparound.

Check all-zero before repetition; compute every adjacent difference from the same old state.
