`cost` is filled backward, with index `n` representing an empty zero-cost suffix. As `j` advances, `letters` only increases; once letters plus minimum gaps exceed the width, no later endpoint can fit.

Each candidate computes its line cost and combines it with the completed suffix. Only equal totals compare `sequence` values. The comparison reads current `q/q+1` gaps followed by the stored suffix without constructing a temporary candidate vector; if their common portion matches, the implementation keeps the longer representative under its documented tie convention.

After selecting `chosen`, `next[i]` stores the break and `sequence[i]` is allocated once by prefixing chosen gaps to the suffix. Output follows `next`, recomputes gaps, and places the `r` longer ones last. Full-line input preserves paragraph boundaries, removes only CR from CRLF, and prints one blank line after each paragraph.
