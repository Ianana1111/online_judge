The whole input is read as bytes into `data`, and the helpers `next_int` and `next_char` share the cursor `pos`. `next_char` skips whitespace before returning one byte, so the `#` is found correctly even if the string were split across lines. Only bytes from A to the n-th letter are counted.

`ranked` holds the counts in decreasing order. The inner function `take(a, b)` scans from 0 for the first unused worker whose count is a or b, which is the smallest feasible letter. One always exists; if not, it raises instead of silently printing a wrong answer.

Each left tier picks a letter and appends the other count to `right_need`; for odd N the middle takes the smallest count; the right half is filled into `order[n - 1 - k]` from the inside out. Finally the letters and the counts are each joined with spaces and printed.
