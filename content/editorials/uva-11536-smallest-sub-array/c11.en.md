Generate the sequence, then maintain a window `[left,right]`. `frequency[v]` counts occurrences of required value `v`, and `covered` counts how many of the `K` required values currently have positive frequency. Values above `K` do not affect coverage.

Expand `right` one position at a time. When adding the first copy of a required value, increment `covered`. Whenever `covered==K`, record the current inclusive length and move `left` rightward as far as possible. Decrement `covered` only when the removed value's frequency reaches zero.

Do not reject `K>M` automatically: values 2 and 3 can still occur in the fixed prefix even when later recurrence values cannot reach them.

Generate the recurrence, then maintain a sliding window with frequencies for 1 through K. When all target values are present, shrink the left edge while updating the shortest valid length.
