A backward cyclic shift undoes encryption for ordinary letters. However, a plaintext letter belonging to the alphabetical key is wrapped in two additional key letters, so shifting the whole line is not enough.

Scan left to right. If the next three characters match the current key letter, a shifted plaintext letter belonging to the key, and the next key letter, consume the wrapper and advance the circular key position. Otherwise consume one character. If that character decodes to a key member, its required wrapper is missing, so report error in encryption.

Reset the key position for each message, not for each word. Copy spaces exactly and never allow a wrapper to cross a space. The guaranteed key property makes decoding unique, so a valid wrapper needs no backtracking.

`decode` reverses the shift; `message`/`decodeMessage` scans and validates wrappers. Preserve empty messages and message spaces while skipping only separators between test cases; an empty key line must also remain meaningful. A message of length L takes O(L) time and O(L) output-buffer space.
