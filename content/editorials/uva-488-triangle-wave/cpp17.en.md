`string(height, char('0' + height))` constructs exactly one row without spaces between its digits. Because amplitude is at most nine, each height is represented by one character. The descending loop begins at `amplitude - 1`, preventing a repeated peak.

`firstWave` is declared outside all test cases and controls separators for the whole file. The program prints the separator before a later wave, then only ordinary row-ending newlines, so it never appends a complete blank line after the final wave.
