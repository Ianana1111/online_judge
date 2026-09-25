Track the current endpoint height. A rising slash occupies its starting, lower row, so draw first and then increment height. A falling backslash occupies its ending, lower row, so decrement first and then draw. A constant segment stays at the current height.

Each input position owns one horizontal column. Store the chosen character in a row string keyed by height. After drawing, print from the highest occupied row through the lowest. Trim only trailing spaces, preserving leading gaps after the vertical axis.

The horizontal axis contains `n+2` dashes: one gap column, `n` plot columns, and one extension. Heights may be negative; only their relative order matters.

For each rise, flat step, or fall, move down before drawing a fall and move up after drawing a rise. Store the segment at its column and height, then print rows top down without trailing spaces.
