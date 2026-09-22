Bit `d-1` in `row`, `column`, or `box` means digit `d` is already used. The box index is `r/3*3+c/3`. Only original zero cells enter `empty`, and input is fully consumed even if an early clue conflict marks the case invalid.

Each search level swaps the cell with the smallest candidate count into position `at`. The lowest candidate bit is extracted with `options & -options`, and `ctz` converts it back to a digit. Failed recursion clears all three masks, resets the grid cell, and restores the empty-cell order. A successful branch keeps the completed grid for output.
