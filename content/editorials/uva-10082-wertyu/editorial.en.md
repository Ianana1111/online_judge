# Decode each key by its physical left neighbor

## Problem and constraints

The typist's hands were shifted one key to the right. Decode every nonspace input character as the key immediately to its left on the same QWERTY keyboard row. Input may contain uppercase letters, digits, spaces, and the pictured punctuation; row-leading keys without a left neighbor are excluded. Multiple lines continue to EOF, and all spaces and line breaks must be preserved.

## Building the approach

This is a physical keyboard mapping, not an alphabetical shift. Write the four keyboard rows in left-to-right order. For each row position `i>=1`, map `row[i]` to `row[i-1]`. Beginning at one prevents accidentally joining the start of one row to the end of another.

Build a 256-entry lookup table once. Initialize it as the identity mapping, then overwrite legal keyboard characters with their left-neighbor mapping. Spaces consequently remain unchanged without a special case.

Read complete lines with `getline`, decode each character through the table, and print one newline after each input line. Word-based extraction would collapse repeated or leading spaces and corrupt the message.

## Walkthrough

In `O S, GOMR YPFSU/`, O maps to I, S to A, and comma to M, giving the start `I AM`; continuing produces `I AM FINE TODAY.`.

The number row follows the same rule: 1 maps to the backquote and equals maps to minus. Backslash maps to right bracket, so processing letters alone is insufficient.

## Why it works

Each row string lists keys in their actual physical order. Therefore the precomputed relation `row[i] -> row[i-1]` is exactly the required left neighbor for every legal nonspace input. The statement excludes row-leading keys, so all such characters have defined mappings.

Every input character is replaced independently with this correct value. Identity-mapped spaces and an emitted newline preserve the complete original layout.

## Complexity

Lookup construction is constant. For `L` input characters, decoding takes `O(L)` time and constant table space beyond the current line.

## Common mistakes

- Shifting right instead of left.
- Using alphabetical rather than keyboard order.
- Reading words and losing whitespace structure.
- Forgetting to escape backslash in the C++ row literal.
