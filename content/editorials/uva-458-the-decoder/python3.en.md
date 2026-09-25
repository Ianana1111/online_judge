Examples show that encoded `J` becomes `C` and an apostrophe becomes a space, both a difference of seven. Normalize printable codes by subtracting 32; decoding is then `(index - 7 + 95) % 95`.

The same operation can be implemented without an explicit modulo table: subtract seven from the character code, and when the result is below 32, add 95 once. Legal encoded values can cross the lower boundary at most once. Read character by character so spaces are not skipped. Branch on LF and CR first and write them unchanged.

Byte processing preserves line endings; values below ASCII 32 wrap by one full cycle of 95.
