For every position `i`, compare it with position `n-1-i`. The ordinary palindrome condition is simply `text[i] == text[n-1-i]`. The mirrored condition requires a defined mapping for `text[i]` and equality between that mapped character and `text[n-1-i]`.

Maintain two booleans from true and clear each independently on its own failed comparison. The mirror map contains characters unchanged by reflection and both directions of the pairs `E <-> 3`, `J <-> L`, `S <-> 2`, and `Z <-> 5`.

The center of an odd-length string must also be checked. A center such as `A` mirrors to itself, while `E` mirrors to `3` and cannot stand alone at the center of a mirrored string.

Ordinary palindromes compare the same characters; mirrored strings compare mapped characters against the opposite side independently.
