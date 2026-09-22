`isPrime` first rejects values below two. Its loop condition includes equality at the square root, ensuring that perfect squares are detected. With the given upper bound, both `d*d` and the reversed integer remain safely within `int`.

The reversal loop uses a separate variable named `rest`, preserving `n` for the final sentence. Multiplying the accumulated reversal by ten and adding `rest % 10` appends exactly one digit per iteration; decimal leading zeroes naturally have no effect on the resulting integer.

Classification checks the original first. The short-circuit condition tests the reversed number for primality only after confirming that it differs from `n`. Building the verdict separately lets one output statement enforce identical spacing and punctuation for all three outcomes.
