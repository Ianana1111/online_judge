Bits zero through six in `mask` represent top, upper-right, lower-right, bottom, lower-left, upper-left, and middle. Testing `segments & (1 << bit)` selects the needed line; hexadecimal constants merely compact seven booleans.

Horizontal rows choose their one bit and print a side space around exactly `size` dashes or blanks. Vertical rows select upper or lower left/right bits around `size` inner spaces. `index > 0` adds one inter-digit column. Each row and each display receive their required newlines, while the input number remains a string for left-to-right digit access.
