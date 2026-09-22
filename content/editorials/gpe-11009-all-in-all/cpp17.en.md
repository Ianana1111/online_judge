`matched` is both the number of characters already found and the index of the next required character. It starts at zero for every input pair.

The range loop consumes each character of t once. The condition checks `matched < s.size()` before accessing `s[matched]`, so after a complete match the remaining target characters are safely ignored. Incrementing only after equality enforces the required order without storing positions explicitly.

The final comparison asks whether all of s was matched, not whether any match occurred. `cin >> s >> t` follows this problem's whitespace-separated input format, and the exact output capitalization is preserved.
