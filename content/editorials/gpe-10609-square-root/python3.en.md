`value.bit_length()` supplies B without a floating-point logarithm. The shift `1 << ((B + 1) // 2)` constructs the proven upper bound exactly.

Both divisions in the Newton update use `//`. `following >= root` is checked before assignment; for the guaranteed perfect-square input, it means the current root is exact. Otherwise the strictly smaller candidate replaces it and the loop continues.

The first input token is the test count, and exactly that many following values are converted to Python integers. Converting each result with `str` emits the full decimal representation. Joining with two newlines creates the required blank line between cases without adding a leading blank line.
