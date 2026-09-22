# Scale a fixed seven-segment mask row by row

## Problem and constraints

Draw decimal input as a seven-segment display at size `1 <= s <= 10`. Each digit occupies `s+2` columns and `2s+3` rows. Horizontal segments use `s` dashes, vertical segments span `s` rows, and adjacent digits have exactly one blank column. Print a blank line after each display. Input `0 0` is the sentinel; a nonzero size displaying number zero is valid. All internal and trailing rectangle spaces matter.

## Building the approach

Represent each digit by seven boolean segment bits: top, upper-right, lower-right, bottom, lower-left, upper-left, and middle. The shape table is independent of scale.

Generate the full number one output row at a time. Rows 0, `s+1`, and `2s+2` are top, middle, and bottom horizontal segments; each digit prints one side space, `s` dashes or spaces, and another side space. Other rows belong to the upper or lower vertical region and print a left segment, `s` inner spaces, and a right segment. Before every digit after the first, add exactly one inter-digit space.

Row-wise generation places digits side by side rather than stacking separately rendered glyphs.

## Walkthrough

For `s=1`, digit 8 has five rows: ` - `, `| |`, ` - `, `| |`, ` - `. At `s=2`, each horizontal segment is two dashes and each vertical region lasts two rows, giving height seven. Two size-two digits occupy four columns each plus one gap, total width nine.

## Why it works

The mask table states exactly which of the seven physical segments each decimal digit lights. Every output row belongs uniquely to one horizontal segment or one of the two vertical regions. The generator fills an enabled segment with its required scaled characters and a disabled segment with equal-width spaces. Thus every digit has exact dimensions and shape, and the extra one-column separators align the combined display.

## Complexity

For `D` digits, output has `2s+3` rows of width `D(s+2)+(D-1)`, so time is proportional to output size, `O(Ds^2)`. Extra space apart from the input and a length-`s` string is `O(1)`.

## Common mistakes

- Confusing a digit's side padding with the inter-digit column.
- Placing the middle segment at row `s` instead of `s+1`.
- Using incorrect masks for 0, 6, or 9.
- Dropping meaningful trailing spaces inside the glyph rectangle.
- Treating every `0` number as the sentinel regardless of size.
