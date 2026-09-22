`getline` reads the test-count line, skips only empty case separators, and preserves complete `plain` and `sub` alphabets. The mapping array uses `unsigned char` indices so byte values never become negative.

All 256 entries first map to themselves, then aligned plaintext entries are overwritten. A content loop stops on `line.empty()` rather than trimmed emptiness, so a spaces-only line remains data. Each byte is translated in order, and case separation plus alphabet display order follow the exact output contract.
