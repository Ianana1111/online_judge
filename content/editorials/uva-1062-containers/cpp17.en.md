`tops` contains no deeper stack data because only the current top constrains the next placement. `lower_bound` returns the first top at least as large as the arriving letter.

Replacing that position keeps the vector ordered: earlier tops are smaller than the new letter and later tops are at least the old, hence at least the new. If the iterator is `end`, the letter is larger than all existing tops and is appended.

The result is `tops.size()`. The case counter increments only for data sequences because the `while` condition excludes the sentinel, and repeated equal letters keep replacing one position.
