The `best` array has `n+1` entries, with its final zero representing the empty suffix. A zero digit copies `best[i+1]` and immediately continues, which correctly handles both isolated and repeated zeros.

For each nonzero start, `value` is rebuilt digit by digit in `long long`. The loop is limited to ten characters and stops as soon as the signed 32-bit maximum is exceeded. Only valid parts are combined with the already computed suffix state, and `best[0]` is the complete answer.
