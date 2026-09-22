`keyboard` stores the physical key order one row at a time. The backslash at the end of the second row is written as `\\` in the C++ string literal. Starting each construction loop at index two guarantees that `i-2` is valid and that mappings never cross rows.

After reading the case count, `cin.ignore(..., '\n')` removes the remaining newline. Running `getline` exactly `N` times then preserves every message line and all spaces inside it.

The zero-initialized lookup array uses a nonzero entry to mean that a mapping exists. Converting `ch` to `unsigned char` makes it safe both as an array index and as an argument to `tolower`. Lookup uses the normalized character; when no mapping exists, the program prints the original character. A newline is added only after the complete input line, so spacing is not reconstructed or altered.
