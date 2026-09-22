The initial row `0..m` is the edit distance from empty text to every pattern prefix. For each character, the three candidates represent deleting the text character, deleting a pattern character, and matching or substituting.

`finished` is computed from `current[m]` before any restart. Only on success does the code combine the row with empty-new-piece costs `j`, while retaining other smaller ongoing states. Swapping rows advances the scan. Returning the last position's flag, rather than whether any earlier prefix succeeded, ensures no text suffix is left unpartitioned.
