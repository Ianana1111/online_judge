# Read each padded column from the last sentence upward

## Problem and constraints

Rotate up to 100 input lines, each at most 100 characters, clockwise by 90 degrees. Lines may contain spaces, punctuation, digits, mixed case, or be empty. After rotation, the last input sentence becomes the leftmost column and the first becomes the rightmost. Unequal lines behave as if padded on the right with spaces.

## Building the approach

Read every complete line and record the maximum width `W`. The rotated output has `W` rows, one for each original column. For output row `column`, visit original rows from the last to the first. Print `lines[row][column]` when it exists, otherwise print one padding space.

Missing cells cannot be skipped: doing so would shift later characters into the wrong output columns. Original leading, internal, and trailing data spaces likewise must not be trimmed. A CR from a CRLF line ending may be removed as newline normalization.

## Walkthrough

For input lines `ABC` and `DE`, view the second as `DE ` after padding. Reading columns upward produces `DA`, `EB`, and ` C`. The leading space on the final output row is required to keep `C` in the column belonging to the first sentence. An empty middle input line still occupies its output column.

## Why it works

An original matrix cell `(row,column)` moves under clockwise rotation to `(column,H-1-row)`. The outer loop fixes the new row `column`, while the descending inner loop visits original rows `H-1` through zero, which are exactly new columns zero through `H-1`. Explicit padding supplies all cells in the conceptual rectangle, so every output position follows this coordinate mapping.

## Complexity

For `H` input lines and maximum width `W`, output takes `O(HW)` time and stored input uses `O(HW)` space.

## Common mistakes

- Reading original rows from first to last and rotating the wrong direction.
- Skipping absent cells instead of printing padding.
- Reading words rather than full lines and losing spaces or empty lines.
- Using the shortest line as the output-row count.
- Trimming meaningful input spaces.
