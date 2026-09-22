One initial `getline` consumes the newline after the test count. For each case, the loop skips separator-only lines, then `istringstream` parses the complete permutation; its length determines `N`.

The values line is tokenized into strings. Iterating destinations and values together writes `answer[index - 1]`, converting from one-based positions. Printing the answer array restores destination order without modifying token text. `tc` adds one blank line only between cases.
