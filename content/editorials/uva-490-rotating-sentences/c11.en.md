Read every complete line and record the maximum width `W`. The rotated output has `W` rows, one for each original column. For output row `column`, visit original rows from the last to the first. Print `lines[row][column]` when it exists, otherwise print one padding space.

Missing cells cannot be skipped: doing so would shift later characters into the wrong output columns. Original leading, internal, and trailing data spaces likewise must not be trimmed. A CR from a CRLF line ending may be removed as newline normalization.

Output column c by reading character c from input lines bottom to top; pad short lines with spaces and preserve trailing spaces.
