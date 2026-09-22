All input values use `long long`. Reducing `base` before the loop keeps both multiplicands below `M`; their product is comfortably within the chosen type under the given modulus bound. `result=1%modulus` covers every zero-exponent edge case.

The low-bit test decides whether to include the current power. Squaring and right-shifting occur on every iteration, not only for set bits. Streaming extraction reads triples regardless of physical line breaks, and one residue is printed for each complete case.
