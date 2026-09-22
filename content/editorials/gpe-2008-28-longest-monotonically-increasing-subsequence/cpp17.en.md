The `up` table is filled from `n-1` toward zero, ensuring that every referenced `up[j]` is already final. Values use `unsigned long long`, which safely represents the stated upper limit `2^32-1`.

`visit` enforces increasing indices through `start` and increasing values through `path.back()`. It pushes a candidate, recursively explores it, and pops it before the next branch. Completed paths are copied into `answers`. No value-based deduplication is performed, so equal printed sequences from distinct index choices remain separate, as required.
