`ending` and `best` are separate `long long` states. `ending` is updated for the current position first, then `best` records the global maximum. The `0LL` literal keeps the `max` operands in the same type.

Starting `best` at zero matches the output's distinction between some positive streak and none; the empty segment is never printed as an actual answer. The loop still consumes exactly `n` values for every case. Both required output sentences preserve their punctuation, including the final period.
