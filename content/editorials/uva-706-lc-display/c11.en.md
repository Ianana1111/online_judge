Represent each digit by seven boolean segment bits: top, upper-right, lower-right, bottom, lower-left, upper-left, and middle. The shape table is independent of scale.

Generate the full number one output row at a time. Rows 0, `s+1`, and `2s+2` are top, middle, and bottom horizontal segments; each digit prints one side space, `s` dashes or spaces, and another side space. Other rows belong to the upper or lower vertical region and print a left segment, `s` inner spaces, and a right segment. Before every digit after the first, add exactly one inter-digit space.

Row-wise generation places digits side by side rather than stacking separately rendered glyphs.

Represent each digit’s lit segments with seven bits. For each display row and digit, draw the horizontal bar, side bars, or spaces as appropriate; preserve spaces inside the final digit and at row ends.
