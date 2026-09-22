The outer `getline` reads a frequency header and skips blank headers. The capped decimal accumulation keeps `target` at most 10,001, so even a very long valid positive header cannot overflow during repeated parsing.

For each content line, the `finish` lambda counts a nonempty `word` and clears it. Explicit ASCII letter ranges implement the statement's English-letter definition; uppercase letters are shifted to lowercase before appending. Calling `finish()` once more after the character loop handles a word ending at the line boundary.

The inner loop excludes an exact `EndOfText` line before tokenization. Finally, map iteration prints matching keys in order and sets `found`. The fallback sentence is printed only if no entry matched, while `first` controls the blank line between cases.
