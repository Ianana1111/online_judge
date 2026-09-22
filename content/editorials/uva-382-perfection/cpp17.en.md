The global header is printed before the input loop and the footer after the zero sentinel or end of file. `total` is initialized to zero for `n == 1` and one otherwise, because 1 is a proper divisor of every larger positive integer.

The divisor loop starts at 2, avoiding both 1 and its excluded partner `n`. On a division, it adds the small divisor and adds `n / divisor` only if the two differ. Classification uses only comparisons with the completed sum. `setw(5)` aligns the number, and the following literal contains exactly two separator spaces.
