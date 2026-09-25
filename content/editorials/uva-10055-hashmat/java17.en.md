Before coding, notice that the input does not guarantee which army is larger. `Math.abs(a - b)` gives the nonnegative difference: `10 12` and `12 10` both produce 2.

Values may reach `2^32`, so use `long`, not `int`. `hasNextLong()` reads until EOF, including the valid `0 0` case. Print one answer for each complete pair.
