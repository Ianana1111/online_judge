Each dataset header is printed before the sentinel check, satisfying the unusual requirement to echo the final `0 0`. The check still happens before constructing a comparator or taking a remainder, preventing modulo by zero.

Values use `long long`, safely holding every signed 32-bit input. The comparator captures the current modulus, returns immediately for unequal remainders, then uses Boolean oddness to put odd values first. Its final strict `>` for odd values and `<` for even values both return false when values are equal.
