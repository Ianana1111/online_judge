Each DNA string is scored immediately, with `i` on the left and `j` beginning at `i+1`, so every distinct position pair is tested once. `entries.first` stores the completed inversion score and `second` the original text.

The `stable_sort` comparison looks only at `first`; equal scores compare false in both directions and preserve input order. A blank line is printed before every dataset after the first. Formatted input skips the separator blank lines while still reading exactly `n`, `m`, and `m` strings.
