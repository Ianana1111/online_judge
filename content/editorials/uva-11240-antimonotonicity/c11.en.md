After choosing a valid prefix, only its last value and the direction needed next affect future choices. Begin with one selected element and `needDown = true`.

When the new value satisfies the needed comparison, append it, increase the length, and flip the direction. When it does not, the length cannot increase, but the new value should still replace the endpoint. While waiting to go down, a larger endpoint is at least as useful; while waiting to go up, a smaller endpoint is at least as useful. In both cases, assigning the current value as `last` retains the favorable extreme of the current monotone run.

Track the next needed direction; increase the answer and flip direction only when an adjacent change fits.
