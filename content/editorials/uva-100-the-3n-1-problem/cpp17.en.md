### Connect each piece of code to the idea

`first` and `second` preserve the input for printing. Only the loop limits use `min` and `max`; reversing an interval therefore does not change which starts are examined.

`memo` uses zero for an unknown length, which is safe because every real length is positive. `memo[1] = 1` supplies the stopping state needed by `cycleLength`.

The `while` loop saves unknown values in `path`. Its condition checks `n > CACHE_LIMIT` first: C++ short-circuit evaluation prevents reading `memo[n]` when `n` is too large. Once the loop ends, `memo[n]` is a known suffix length.

The reverse iterator then reconstructs the omitted prefix. Each increment corresponds to one predecessor on the path. Even a value too large to cache still contributes to the returned length. Using `unsigned long long` for both `n` and the path means the intermediate arithmetic is performed in that type from the start.
