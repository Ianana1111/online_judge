Keep the original excuse untouched for output. Separately scan it into maximal runs of ASCII letters. Append lowercase letters to a token buffer. Whenever a digit, space, or punctuation character appears, finish the token: if it is in the keyword set, add one point, then clear it. Finish once more at end of line so a final word without punctuation is not lost.

This tokenization prevents a keyword such as `dog` from matching inside `dogmatic`, while a digit in `DOG2dog` correctly splits two words. A hash set gives one membership test per completed word.

After scoring every line, find the maximum and print all lines with that score. Starting the maximum at zero ensures that when no keyword occurs, every zero-score excuse is printed.

Tokenize maximal ASCII-letter runs, using every other character as a separator. Compare lowercase tokens but print original lines, counting repeated complete-word occurrences.
