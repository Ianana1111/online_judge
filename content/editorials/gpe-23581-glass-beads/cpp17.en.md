Candidates start at zero and one, with a zero common-prefix length. Modulo indexing wraps comparisons across the end of the necklace. Equal characters only extend `k`; a mismatch moves the losing candidate by the full `k+1`, which is essential for linear behavior.

After a jump, an equality of `i` and `j` is resolved by advancing the moved pointer. The `k<n` loop condition prevents all-equal or periodic inputs from comparing forever. Finally, `min(i,j)+1` both chooses the earliest equal rotation and converts to the problem's one-based position.
