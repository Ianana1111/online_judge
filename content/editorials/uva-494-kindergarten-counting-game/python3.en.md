Keep a boolean `inside` telling whether the preceding character belongs to a letter run. For the current character, compute whether it is an ASCII letter. If it is a letter while `inside` is false, a new word begins, so increment the count. Then assign `inside = letter`; any separator automatically leaves the current word.

Counting starts rather than ends means a word at the final character is already counted and needs no special flush. Reset both state and count for each input line so letters on adjacent lines never join.

The state resets per input line, and the `ord` comparisons accept only ASCII letters.
