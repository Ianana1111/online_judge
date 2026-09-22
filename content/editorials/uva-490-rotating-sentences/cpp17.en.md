`lines` preserves each line's actual content and `width` tracks the maximum so no suffix of a longer line is lost. Only a terminal carriage return is removed; ordinary spaces remain data.

The descending `row` variable is a signed `int`, allowing it to stop after -1 without unsigned wraparound. Before indexing a line, the conditional checks whether `column` exists; otherwise it emits padding. Every new rotated row ends with one newline and contains exactly the original number of row positions.
