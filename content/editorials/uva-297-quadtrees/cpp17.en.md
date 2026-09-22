The position index is passed by reference, so every node and its four consecutive subtrees advance one shared cursor. Each image resets its own cursor to zero but shares the bitmap.

The four recursive calls follow upper-right, upper-left, lower-left, lower-right order. Side length halves to one at maximum depth. Full leaves set booleans true only; empty leaves write nothing. Final nested loops convert each boolean to zero or one and print the exact required sentence.
