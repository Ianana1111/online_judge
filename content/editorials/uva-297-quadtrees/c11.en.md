Start a white 32-by-32 boolean bitmap. Recursively parse a tree while carrying region top-left and side length. For `f`, set every pixel in the region true; for `e`, do nothing; for `p`, halve the side and parse exactly four quadrants in the prescribed order.

Paint both trees into the same bitmap. Setting true is idempotent, so overlap naturally counts once. A white leaf must never clear black from the other image, and every subtree must still be consumed even when an area is already black.

Paint both trees into one 32-by-32 Boolean canvas. A full node paints its region, an empty node does nothing, and a parent recursively visits the prescribed four quadrants. Count painted pixels for the union.
