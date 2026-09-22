The exponent is an `unsigned long long`, covering the full legal input range near `2^63`. The base and result remain reduced below `MOD`; multiplying two such values stays within signed `long long`.

`exponent & 1` tests the current binary digit. Squaring advances the base from `3^(2^k)` to `3^(2^(k+1))`, while the right shift removes the processed digit. The main loop computes `3^n-2`, adds one modulus before the final remainder, and prints one line for every value read until EOF.
