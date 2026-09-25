Scan one character at a time. Convert uppercase ASCII letters to lowercase. If the character is a lowercase letter, append it to the current word. Otherwise, the maximal letter run has ended: insert the word into an ordered set if nonempty and clear the buffer.

A delimiter must terminate rather than merely disappear. For example, `red-blue` contains two words, not `redblue`.

After EOF, flush once more because the file may end immediately after a letter with no newline or punctuation. The ordered set simultaneously removes duplicates and maintains lexical output order.

Only letters belong to a word; any other character ends it. Lowercase, deduplicate, and sort all words.
