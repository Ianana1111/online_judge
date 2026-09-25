Repeatedly take `value % 2` to obtain the current least significant bit, append its character, add it to the one counter, and divide the value by two to remove that bit.

The extracted sequence runs from least significant to most significant, opposite normal notation, so reverse the string afterward. The final extracted bit of a positive value is one, ensuring no leading zero after reversal.

This generates only the necessary digits rather than a fixed-width 32-bit string.

Print the full count of one bits, not that count modulo two, alongside a binary string without leading zeroes.
