Directly choosing a `UUU` starting position double-counts strings such as `UUUU`. Instead count safe strings containing no `UUU` and subtract from all `2^n` strings.

Let `safe[n]` be the safe count. Set `safe[0]=1`, `safe[1]=2`, and `safe[2]=4`. For `n >= 3`, a safe string ends in exactly one of `L`, `LU`, or `LUU`, according to whether it has zero, one, or two trailing `U`s. Removing that suffix leaves an arbitrary safe string of lengths `n-1`, `n-2`, or `n-3`, so

`safe[n] = safe[n-1] + safe[n-2] + safe[n-3]`.

The required result is `2^n - safe[n]`.

A safe string ends in 0, 10, or 110, giving a recurrence from the previous three lengths.
