Read each text as a vector containing exactly its declared number of complete lines. Equality of these vectors checks line count, line boundaries, every character, and every space, exactly matching Accepted.

Only after exact comparison fails, build a visible string for each side by concatenating nonwhitespace characters in order. Unlike the original UVa variant, letters and punctuation matter here; filtering only digits is wrong.

The printed character count is the sum of original standard line lengths. It excludes newline separators but retains spaces and is independent of the team output or visible filtering.

First compare the output line by line, preserving whitespace and line breaks. Only if that fails, remove ASCII whitespace and compare visible characters. Separately count the standard output bytes without newline characters.
