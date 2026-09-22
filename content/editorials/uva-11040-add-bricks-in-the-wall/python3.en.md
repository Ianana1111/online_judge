Rows are allocated with lengths `r+1`, matching the triangular shape. Exactly fifteen inputs are placed at even row and column indices, independent of their visual line wrapping.

For each local triangle, the two lower endpoints determine `middle`, then the two intervening values. Python `//2` is exact here because valid cases guarantee an even numerator, including for negative values.

Every row is joined with single spaces. No unrequested blank line is inserted between test cases.
