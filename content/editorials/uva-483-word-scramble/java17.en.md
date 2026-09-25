Read the stream one character at a time and accumulate non-whitespace characters in a buffer. When a whitespace character arrives, reverse and print the buffered word, clear it, and then print that separator unchanged. After end of file, flush once more because the final word may have no following separator.

An empty buffer is safe to flush, so consecutive whitespace characters need no special branch. Formatted word input would lose how many separators appeared and whether they were spaces, tabs, or newlines, which is why the character stream matters.

Buffer word bytes and emit them in reverse at separators without collapsing repeated whitespace.
