Use a 26-character lookup indexed by `ch-'A'`: ABC map to 2, DEF to 3, through PQRS to 7, TUV to 8, and WXYZ to 9. An explicit table correctly handles the two four-letter keys.

Scan the mutable string. For an uppercase letter, increment `letters` before replacing it from the table. For a hyphen, increment `hyphens` and leave it unchanged. Zero and one match neither branch and also remain unchanged.

Counts reset for each input expression, and a single `0` is ordinary data rather than a sentinel.

The lookup string follows A through Z and directly includes the four-letter groups for 7 and 9.
