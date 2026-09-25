Splitting only on spaces is not enough. `beta123BETA` contains two words, and `Can't` contains `can` and `t`. Instead, scan characters while accumulating the current run of letters.

Convert each letter to lowercase immediately. On a nonletter, count the accumulated word if nonempty and clear it. Do the same at every line end, since a newline also separates words. Check for the sentinel line before scanning it so the marker never enters the frequency table.

An ordered map both counts words and provides the required alphabetical output order. After reading the entire text, keep only entries whose count equals the target. Because the text contains at most 10,000 words, any larger target has no answer; the parser can safely cap a huge target at 10,001 rather than overflow a fixed-width integer.

Treat only consecutive ASCII letters as words, lowercase them, and count occurrences; every other character separates words. Print words with exactly the requested frequency in lexicographic order, leaving one blank line between texts.
