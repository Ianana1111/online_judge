This is a physical keyboard mapping, not an alphabetical shift. Write the four keyboard rows in left-to-right order. For each row position `i>=1`, map `row[i]` to `row[i-1]`. Beginning at one prevents accidentally joining the start of one row to the end of another.

Build a 256-entry lookup table once. Initialize it as the identity mapping, then overwrite legal keyboard characters with their left-neighbor mapping. Spaces consequently remain unchanged without a special case.

Read complete lines with `getline`, decode each character through the table, and print one newline after each input line. Word-based extraction would collapse repeated or leading spaces and corrupt the message.

Build a current-key to left-key lookup first; preserve spaces and line breaks.
