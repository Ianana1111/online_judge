Use a 26-character lookup indexed by `ch-'A'`: ABC map to 2, DEF to 3, through PQRS to 7, TUV to 8, and WXYZ to 9. An explicit table correctly handles the two four-letter keys.

Scan the mutable string. For an uppercase letter, increment `letters` before replacing it from the table. For a hyphen, increment `hyphens` and leave it unchanged. Zero and one match neither branch and also remain unchanged.

Counts reset for each input expression, and a single `0` is ordinary data rather than a sentinel.

Keep 0, 1, and hyphens unchanged; the count fields are an extra requirement of this site.
