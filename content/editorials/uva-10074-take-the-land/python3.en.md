Enumerating all four rectangle boundaries is unnecessarily quartic. Fix a top row, then extend a bottom row downward. Maintain `clear[c]`, which is true exactly when every cell in column `c` from top through bottom is zero. On each new bottom row, update it with logical AND.

For fixed top and bottom, a valid rectangle is simply a consecutive run of true columns. Scan left to right: increment `current` on a clear column and reset it on a blocked column. Multiply the run length by the inclusive height and update the best area.

When choosing a new top row, reset all columns to true; while extending one top, preserve false values so a tree cannot disappear from the vertical interval.

Fix top and bottom rows. A column is usable only if every cell in that vertical span is zero. Consecutive usable width times height gives a candidate area.
