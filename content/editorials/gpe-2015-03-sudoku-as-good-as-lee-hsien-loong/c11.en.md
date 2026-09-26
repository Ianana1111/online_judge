Sudoku is about preserving three constraints, not blindly guessing digits in order: every row, column, and 3×3 box must contain no duplicates. Inspect the given clues first. Conflicting clues mean NO; they may not be rewritten.

Represent used digits with nine-bit masks. Digit d corresponds to 1<<(d−1). A blank cell's candidates are the bits of 511 outside the union of its row, column, and box masks. No candidate means this search branch is impossible.

Choose the blank with the fewest candidates instead of always taking the top-left blank. This exposes contradictions early and avoids branching first on unconstrained cells. Swap the chosen position into empty[at], try each candidate, and update all three masks. After a failed branch, undo the masks and reset the cell to zero. Restore the swapped blank order when every candidate fails.

Filling all blanks produces a valid completion; any valid completion is accepted. Worst-case search remains exponential: choosing constrained cells reduces practical branching, not the worst-case bound. Recursion depth is at most 81 and state storage is O(81). Python bin(mask).count("1")/bit_length and Java bitCount/numberOfTrailingZeros handle bits; C uses short loops without compiler-specific helpers.
