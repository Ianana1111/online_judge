A general solution tracks every digit seen, but adjacent digits here differ by exactly one. Any walk visiting both 0 and base−1 must pass through every intermediate digit. Conversely, covering all digits necessarily includes both endpoints.

This version needs only two flags: bit zero means 0 has appeared, and bit one means base−1 has appeared. dp[mask][last] counts current-length numbers ending in last with those flags. Initialize one one-digit number for each starting digit from 1 through base−1; leading zero is forbidden.

Append only last−1 or last+1, checking their range before updating endpoint flags. Write to a separate next table so states created in this round cannot extend again immediately. Only mask=3 represents complete digit coverage.

The question asks for at most length digits, not exactly length. Accumulate each round's complete counts into answer[length]; answer[0] stays zero. Reduce every addition modulo 1000000007. C/Java add only two reduced values at a time, staying within signed 32-bit range. For each base, precomputation takes O(100×base×4) time and O(base) rolling DP storage, plus 101 cumulative answers.
