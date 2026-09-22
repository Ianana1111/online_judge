The matrix is read as directed and is not preprocessed by full Floyd. Reverse iteration activates the last-deleted tower first, and `active` is exactly the current surviving set.

Relaxation still loops over every possible endpoint, which propagates old intermediate improvements into towers activated later. Only summation loops over `active`; diagonal zeroes are harmless. `answer` persists across all stages and is a `long long` even though individual matrix entries fit `int`.
