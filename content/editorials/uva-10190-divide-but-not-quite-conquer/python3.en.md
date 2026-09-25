Reject `n<=1` and `m<=1` first. This prevents division by zero, nondecreasing loops for one, and the locally disallowed zero-division singleton.

Start a stored sequence with n. While the current value exceeds one and is divisible by m, divide exactly and append the quotient. When the loop ends, success occurs only if the current value is one. Otherwise a nonzero remainder prevented the uniquely determined next step.

Do not print values as they are generated. A sequence may remain exact for several steps and then fail; buffering lets the entire partial result be discarded in favor of the single failure phrase.

Print the sequence only if every division by m is exact and reaches one; exclude m≤1 to avoid a loop.
