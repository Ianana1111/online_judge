Matrix digits are read as characters and converted by subtracting `'0'`; formatted extraction handles both contiguous and whitespace-separated input. A row operation swaps vectors, while a column operation visits every row.

The transpose inner loop begins at `r+1`, preventing double swaps. Increment and decrement share one branch with deltas 1 and 9, keeping every stored value from 0 through 9. Output reads the current matrix and preserves the exact case header and trailing blank line.
