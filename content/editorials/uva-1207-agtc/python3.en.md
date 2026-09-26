Start with ordinary edit distance: the last operation between two prefixes is deletion, insertion, or alignment of their last characters. Alignment costs zero for a match and one for replacement. Take the minimum; an empty prefix costs the other prefix's length.

Updating a large matrix cell by cell is expensive in Python. This solution uses Myers bit vectors to encode adjacent differences within a row. `positive` marks +1 differences and `negative` marks −1; neither bit is set for zero. Adjacent edit distances differ by at most one, so these vectors represent the whole row.

`matches` stores a bit mask of source positions for each character. For each target character, addition and its carries in `horizontal` propagate the cellwise recurrence in parallel. `up` and `down` represent the new positive and negative differences. Their highest bits determine whether the full-source score increases or decreases. Shifting aligns the vectors for the next row, and `mask` discards bits beyond the source length.

This computes exact unit-cost insertion, deletion, and substitution distance. It neither replaces the problem with LCS nor truncates the search. Use the shorter string as source; an empty source returns the target length. With B bits per integer word and string lengths m≤n, the main loop takes O(n⌈m/B⌉) time. The four DNA masks and work vectors use O(m) bits.
