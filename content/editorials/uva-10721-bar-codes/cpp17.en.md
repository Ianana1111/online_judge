The first table dimension is the exact number of bars and the second is total width. Actual color need not appear in the state because it alternates deterministically. The only valid zero-bar state has width zero.

The innermost loop limits `width` by both `m` and `total`, avoiding a negative index. Every transition reads only the previous bar-count row, so it adds exactly one visible bar.

Impossible states receive no valid transition and remain zero, handling bounds such as `K>N` without special branches. The final `ways[k][n]` is already a 64-bit count.
