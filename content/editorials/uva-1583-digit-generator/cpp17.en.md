The table starts at zero. `target` begins as `value`, while disposable copy `x` contributes every decimal remainder without modifying the candidate itself.

Short-circuit conditions first verify the target is within the array, then that its slot is still zero. Ascending values make an existing entry strictly smaller, so no comparison is needed. All queries share the one precomputed table and require only direct indexing.
