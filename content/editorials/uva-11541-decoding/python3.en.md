Scan with index `i`. Read one letter, reset `count` to zero, then consume every following digit with `count = count*10 + digit`. When the next letter or end of string is reached, append `count` copies of that letter. Repeat until input is exhausted.

Runs of the same letter separated by another run must remain separate in output order. The count is local to each run, and expansion must occur even when the digit scan ends at the string boundary.

A letter may have a multi-digit count; accumulate digits until the next letter rather than reading only one digit.
