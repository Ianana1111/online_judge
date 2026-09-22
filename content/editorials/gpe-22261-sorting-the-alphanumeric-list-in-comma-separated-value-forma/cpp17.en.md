`trim` searches only for the first and last non-space characters, preserving every internal character. Each `Record` keeps its normalized key, original line, and input index. Field extraction uses substrings without mutating the source line.

`vector<string>` already supplies the required lexicographic field comparison and shorter-prefix behavior. The index is used only when keys match. Actual empty lines delimit datasets, while a line containing spaces remains data. Output prints `record.original`, including trailing spaces, and inserts one blank line between datasets.
