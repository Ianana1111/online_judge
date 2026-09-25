Treat the irregular pairs as highest-priority overrides in a map. For each query, return the mapped value immediately if present. Otherwise evaluate the suffix rules with one `if / else if / else` chain so exactly the first applicable rule runs.

The consonant-plus-`y` rule requires at least two characters, a final `y`, and a preceding letter outside `aeiou`. A one-letter `y` has no preceding consonant. For two-letter suffixes such as `ch` and `sh`, a helper should check the word length before comparing its ending, avoiding unsafe indices.

Look up irregular plurals first; only otherwise apply the suffix rules for y, o/s/ch/sh/x, or plain s.
