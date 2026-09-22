The 48-entry `long long` length table covers levels zero through 47. `at` follows only the child containing the target; entering the right child subtracts the left length first.

Input `n` remains 64-bit until parity reduction. Levels at most 47 keep their exact definition. Query positions use wide integers, and the result reserves only its bounded requested length before outputting one line.
